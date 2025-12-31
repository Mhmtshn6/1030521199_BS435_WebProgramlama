from datetime import datetime
import random
import os
from pathlib import Path
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLField, create_engine, Session

try:
    load_dotenv()
except Exception:
    pass


class RoundRequest(BaseModel):
    difficulty: str = Field(..., examples=["Kolay"])
    category: str = Field(..., examples=["Manzara"])


class RoundItem(BaseModel):
    id: str
    title: str
    description: str
    imageUrl: str
    isAi: bool


class RoundResponse(BaseModel):
    items: list[RoundItem]
    correctId: str
    hint: str


class ResultRequest(BaseModel):
    correct: bool
    attempts: int = Field(..., ge=1, le=2)
    score: int = Field(..., ge=0)
    difficulty: str
    category: str
    finishedAt: datetime | None = None


class GameResult(SQLModel, table=True):
    __tablename__ = "gameresult"
    __table_args__ = {'extend_existing': True}
    
    id: int | None = SQLField(default=None, primary_key=True)
    correct: bool
    attempts: int
    score: int
    difficulty: str
    category: str
    finished_at: datetime = SQLField(default_factory=datetime.utcnow)


app = FastAPI(title="AI Guess Game API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"

if PUBLIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(PUBLIC_DIR)), name="static")

engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


hint_by_category = {
    "Manzara": [
        "Horizon çizgisinde tutarsızlık var mı bak.",
        "Ağaç ve taş gibi tekrar eden dokulara odaklan.",
    ],
    "Hayvan": [
        "Tüy veya kürk dokusu doğal mı kontrol et.",
        "Gözlerdeki ışık yansımaları gerçekçi mi incele.",
    ],
    "Nesne": [
        "Yansımalar fiziksel olarak doğru mu değerlendir.",
        "Metal veya plastik yüzeylerde garip desenler var mı bak.",
    ],
}

hint_by_difficulty = {
    "Kolay": [
        "Parlak alanlara dikkat et - AI görsellerinde genelde aşırı parlaklık olur.",
        "Belirsiz kenarlar var mı kontrol et - AI görsellerinde kenarlar bulanık olabilir.",
        "Renk geçişlerine bak - AI görsellerinde renk geçişleri doğal olmayabilir.",
    ],
    "Orta": [
        "Gölge yönleri birbiriyle uyumlu mu bak.",
        "Farklı materyallerin geçişlerini incele.",
        "Işık kaynaklarını kontrol et.",
    ],
    "Zor": [
        "Doku tekrarlarında hata var mı arama.",
        "Işık kaynaklarını karşılaştır.",
        "Fiziksel tutarsızlıkları bul.",
    ],
}

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
PEXELS_API_URL = "https://api.pexels.com/v1/search"

def get_image_url(path: str) -> str:
    if path.startswith("http"):
        return path
    return f"/{path}"

async def fetch_pexels_image(query: str, category: str = "", retry_queries: list = None) -> dict | None:
    if not PEXELS_API_KEY:
        print("❌ PEXELS_API_KEY bulunamadı!")
        return None
    
    print(f"🔍 Pexels'de arıyor: '{query}' (Kategori: {category})")
    
    # Basit ama etkili filtreleme
    category_keywords = {
        "Hayvan": ["cat", "dog", "bird", "animal", "pet", "wildlife", "horse", "cow", "sheep", "rabbit", "deer", "kitten", "puppy", "feline", "canine", "mammal"],
        "Manzara": ["landscape", "mountain", "forest", "beach", "ocean", "sea", "lake", "river", "valley", "nature", "scenic", "view", "countryside", "outdoor", "natural", "horizon", "sky", "sunset"],
        "Nesne": ["cup", "mug", "book", "phone", "computer", "camera", "chair", "table", "lamp", "clock", "bottle", "glass", "bowl", "object", "item"]
    }
    
    # Kategori için özel query'ler
    if category == "Hayvan":
        search_queries = [f"cute {query}", f"{query} animal", f"{query} pet"]
    elif category == "Manzara":
        search_queries = [f"{query} landscape", f"beautiful {query}", f"scenic {query}"]
    elif category == "Nesne":
        search_queries = [f"{query} object", f"isolated {query}", f"{query} white background"]
    else:
        search_queries = [query]
    
    # Orientation ayarı
    orientation = None
    if category == "Manzara":
        orientation = "landscape"
    elif category == "Hayvan":
        orientation = "square"
    
    for search_query in search_queries:
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "query": search_query,
                    "per_page": 30,
                    "size": "medium"
                }
                if orientation:
                    params["orientation"] = orientation
                
                print(f"📡 API çağrısı: '{search_query}' (orientation: {orientation})")
                
                response = await client.get(
                    PEXELS_API_URL,
                    params=params,
                    headers={"Authorization": f"Bearer {PEXELS_API_KEY}"},
                    timeout=10.0,
                )
                
                print(f"📊 API yanıt: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    photos = data.get("photos", [])
                    
                    print(f"📸 Toplam fotoğraf: {len(photos)}")
                    
                    if not photos:
                        continue
                    
                    # Basit filtreleme
                    valid_photos = []
                    required_keywords = category_keywords.get(category, [])
                    
                    for i, photo in enumerate(photos):
                        alt_text = (photo.get("alt") or "").lower()
                        
                        if i < 5:  # İlk 5'ini debug için göster
                            print(f"  🖼️  {i+1}. Alt text: '{alt_text[:80]}...'")
                        
                        # Alt text kontrolü
                        if not alt_text or len(alt_text) < 10:
                            if i < 5:
                                print(f"    ❌ Alt text çok kısa veya yok")
                            continue
                        
                        # Kategori kelimesi var mı?
                        has_category_keyword = any(keyword in alt_text for keyword in required_keywords)
                        
                        if i < 5:
                            print(f"    ✅ Kategori kelimesi var: {has_category_keyword}")
                        
                        if has_category_keyword:
                            valid_photos.append(photo)
                            if i < 5:
                                print(f"    ✅ GEÇERLİ FOTOĞRAF!")
                    
                    print(f"🎯 Geçerli fotoğraf sayısı: {len(valid_photos)}")
                    
                    if len(valid_photos) > 0:
                        photo = random.choice(valid_photos)
                        print(f"✅ Seçilen fotoğraf: {photo.get('alt', 'No alt')[:50]}")
                        return {
                            "url": photo["src"]["large"],
                            "title": photo.get("alt", search_query)[:50],
                        }
                        
        except Exception as e:
            print(f"❌ Pexels API hatası: {e}")
            continue
    
    print(f"❌ Hiç uygun fotoğraf bulunamadı!")
    return None

# Pexels başarısız olursa kullanılacak backup resimler
backup_real_images = {
    "Hayvan": [
        {"url": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=480&h=320&fit=crop", "title": "Sevimli Kedi"},
        {"url": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=480&h=320&fit=crop", "title": "Golden Retriever"},
        {"url": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=480&h=320&fit=crop", "title": "Renkli Kuş"},
        {"url": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=480&h=320&fit=crop", "title": "Tavşan"},
        {"url": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=480&h=320&fit=crop", "title": "At"},
    ],
    "Manzara": [
        {"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=320&fit=crop", "title": "Dağ Manzarası"},
        {"url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=480&h=320&fit=crop", "title": "Orman Yolu"},
        {"url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&h=320&fit=crop", "title": "Sahil"},
        {"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=320&fit=crop", "title": "Göl"},
        {"url": "https://images.unsplash.com/photo-1464822759844-d150baec013c?w=480&h=320&fit=crop", "title": "Vadi"},
    ],
    "Nesne": [
        {"url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=480&h=320&fit=crop", "title": "Kahve Fincanı"},
        {"url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=480&h=320&fit=crop", "title": "Kitap"},
        {"url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=480&h=320&fit=crop", "title": "Lamba"},
        {"url": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=480&h=320&fit=crop", "title": "Sandalye"},
        {"url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=480&h=320&fit=crop", "title": "Kamera"},
    ]
}

ai_images_by_category = {
    "Manzara": [
        {"id": "ai-manzara-1", "title": "Görsel 1", "description": "", "path": "ai/ai-manzara-1.jpg"},
        {"id": "ai-manzara-2", "title": "Görsel 2", "description": "", "path": "ai/ai-manzara-2.jpg"},
        {"id": "ai-manzara-3", "title": "Görsel 3", "description": "", "path": "ai/ai-manzara-3.jpg"},
        {"id": "ai-manzara-4", "title": "Görsel 4", "description": "", "path": "ai/ai-manzara-4.jpg"},
        {"id": "ai-manzara-5", "title": "Görsel 5", "description": "", "path": "ai/ai-manzara-5.jpg"},
        {"id": "ai-manzara-6", "title": "Görsel 6", "description": "", "path": "ai/ai-manzara-6.jpg"},
        {"id": "ai-manzara-7", "title": "Görsel 7", "description": "", "path": "ai/ai-manzara-7.jpg"},
        {"id": "ai-manzara-8", "title": "Görsel 8", "description": "", "path": "ai/ai-manzara-8.jpg"},
    ],
    "Hayvan": [
        {"id": "ai-hayvan-1", "title": "Görsel 1", "description": "", "path": "ai/ai-hayvan-1.jpg"},
        {"id": "ai-hayvan-2", "title": "Görsel 2", "description": "", "path": "ai/ai-hayvan-2.jpg"},
        {"id": "ai-hayvan-3", "title": "Görsel 3", "description": "", "path": "ai/ai-hayvan-3.jpg"},
        {"id": "ai-hayvan-4", "title": "Görsel 4", "description": "", "path": "ai/ai-hayvan-4.jpg"},
        {"id": "ai-hayvan-5", "title": "Görsel 5", "description": "", "path": "ai/ai-hayvan-5.jpg"},
        {"id": "ai-hayvan-6", "title": "Görsel 6", "description": "", "path": "ai/ai-hayvan-6.jpg"},
        {"id": "ai-hayvan-7", "title": "Görsel 7", "description": "", "path": "ai/ai-hayvan-7.jpg"},
    ],
    "Nesne": [
        {"id": "ai-nesne-1", "title": "Görsel 1", "description": "", "path": "ai/ai-nesne-1.jpg"},
        {"id": "ai-nesne-2", "title": "Görsel 2", "description": "", "path": "ai/ai-nesne-2.jpg"},
        {"id": "ai-nesne-3", "title": "Görsel 3", "description": "", "path": "ai/ai-nesne-3.jpg"},
        {"id": "ai-nesne-4", "title": "Görsel 4", "description": "", "path": "ai/ai-nesne-4.jpg"},
        {"id": "ai-nesne-5", "title": "Görsel 5", "description": "", "path": "ai/ai-nesne-5.jpg"},
        {"id": "ai-nesne-6", "title": "Görsel 6", "description": "", "path": "ai/ai-nesne-6.jpg"},
    ],
}

real_image_queries = {
    "Manzara": [
        "landscape mountain",
        "landscape forest",
        "landscape beach",
        "landscape valley",
        "landscape lake",
        "landscape mountain peak",
        "landscape nature",
        "landscape coastal",
        "scenic landscape",
        "natural landscape",
        "mountain landscape view",
        "forest landscape",
        "ocean landscape",
        "countryside landscape"
    ],
    "Hayvan": [
        "animal cat",
        "animal dog",
        "animal bird",
        "animal rabbit",
        "animal horse",
        "animal cow",
        "animal sheep",
        "animal deer",
        "wildlife animal",
        "pet animal",
        "animal portrait",
        "animal closeup",
        "mammal animal",
        "feline animal",
        "canine animal"
    ],
    "Nesne": [
        "object cup",
        "object lamp",
        "object book",
        "object camera",
        "object chair",
        "object bowl",
        "object glasses",
        "object pencil",
        "object vase",
        "object clock",
        "object keyboard",
        "object phone",
        "isolated object",
        "still life object",
        "everyday object"
    ],
}


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/round", response_model=RoundResponse)
async def create_round(payload: RoundRequest):
    category = payload.category
    queries = real_image_queries.get(category, real_image_queries["Manzara"])
    ai_pool = ai_images_by_category.get(category, ai_images_by_category["Manzara"])
    
    ai_index = random.randrange(3)
    items = []
    
    for idx in range(3):
        if idx == ai_index:
            ai_item = random.choice(ai_pool)
            items.append(
                RoundItem(
                    id=ai_item["id"],
                    title=ai_item["title"],
                    description=ai_item["description"],
                    imageUrl=get_image_url(ai_item["path"]),
                    isAi=True,
                )
            )
        else:
            query = random.choice(queries)
            retry_queries = [q for q in queries if q != query][:3]
            pexels_data = await fetch_pexels_image(query, category, retry_queries)
            if pexels_data:
                    items.append(
                        RoundItem(
                            id=f"real-{idx}-{random.randint(1000, 9999)}",
                            title=f"Görsel {idx + 1}",
                            description="",
                            imageUrl=pexels_data["url"],
                            isAi=False,
                        )
                    )
            else:
                # Pexels başarısız olursa backup resimler kullan
                backup_images = backup_real_images.get(category, backup_real_images["Nesne"])
                backup_image = random.choice(backup_images)
                items.append(
                    RoundItem(
                        id=f"real-{idx}-{random.randint(1000, 9999)}",
                        title=backup_image["title"],
                        description="",
                        imageUrl=backup_image["url"],
                        isAi=False,
                    )
                )
    
    correct_id = items[ai_index].id
    category_hints = hint_by_category.get(category, [])
    difficulty_hints = hint_by_difficulty.get(payload.difficulty, [])
    
    if payload.difficulty == "Kolay":
        combined = [*category_hints, *difficulty_hints]
        hint = combined[random.randrange(len(combined))] if combined else "Detayları incele."
    elif payload.difficulty == "Orta":
        combined = [*category_hints, *difficulty_hints]
        hint = combined[random.randrange(len(combined))] if combined else "Detayları incele."
    else:
        hint = difficulty_hints[random.randrange(len(difficulty_hints))] if difficulty_hints else "Detayları incele."
    
    return RoundResponse(items=items, correctId=correct_id, hint=hint)


@app.post("/result")
def save_result(payload: ResultRequest):
    record = GameResult(
        correct=payload.correct,
        attempts=payload.attempts,
        score=payload.score,
        difficulty=payload.difficulty,
        category=payload.category,
        finished_at=payload.finishedAt or datetime.utcnow(),
    )
    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)
    return {"id": record.id, "saved": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


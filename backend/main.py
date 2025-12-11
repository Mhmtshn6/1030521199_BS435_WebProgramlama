from datetime import datetime
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLField, create_engine, Session


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

engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


hint_by_category = {
    "Manzara": [
        "Horizon çizgisinde tutarsızlık var mı bak.",
        "Ağaç ve taş gibi tekrar eden dokulara odaklan.",
    ],
    "Portre": [
        "Gözlerdeki ışık yansımaları doğal mı kontrol et.",
        "Yüz simetrisi fazla kusursuz mu incele.",
    ],
    "Nesne": [
        "Yansımalar fiziksel olarak doğru mu değerlendir.",
        "Metal veya plastik yüzeylerde garip desenler var mı bak.",
    ],
}

hint_by_difficulty = {
    "Kolay": ["Parlak alanlara dikkat et.", "Belirsiz kenarlar var mı kontrol et."],
    "Orta": ["Gölge yönleri birbiriyle uyumlu mu bak.", "Farklı materyallerin geçişlerini incele."],
    "Zor": ["Doku tekrarlarında hata var mı arama.", "Işık kaynaklarını karşılaştır."],
}

images_by_category = {
    "Manzara": [
        {
            "id": "a",
            "title": "Dağ manzarası",
            "description": "Uzakta karla kaplı dağlar ve ön planda göl.",
            "imageUrl": "https://picsum.photos/seed/mountain-real-1/480/320",
        },
        {
            "id": "b",
            "title": "Orman patikası",
            "description": "Ağaçların arasından geçen dar bir yol.",
            "imageUrl": "https://picsum.photos/seed/forest-real-2/480/320",
        },
        {
            "id": "c",
            "title": "Sahilde gün batımı",
            "description": "Ufukta turuncu tonlarda güneş batışı.",
            "imageUrl": "https://picsum.photos/seed/beach-real-3/480/320",
        },
    ],
    "Portre": [
        {
            "id": "a",
            "title": "Genç kadın portresi",
            "description": "Stüdyoda çekilmiş yumuşak ışıklı portre.",
            "imageUrl": "https://picsum.photos/seed/portrait-real-1/480/320",
        },
        {
            "id": "b",
            "title": "Yaşlı adam portresi",
            "description": "Yüz çizgileri belirgin, karakteristik bir ifade.",
            "imageUrl": "https://picsum.photos/seed/portrait-real-2/480/320",
        },
        {
            "id": "c",
            "title": "Profil portre",
            "description": "Yandan görünüm, saç detayları önde.",
            "imageUrl": "https://picsum.photos/seed/portrait-real-3/480/320",
        },
    ],
    "Nesne": [
        {
            "id": "a",
            "title": "Metal kahve fincanı",
            "description": "Parlak yansımalar içeren metal bir fincan.",
            "imageUrl": "https://picsum.photos/seed/object-real-1/480/320",
        },
        {
            "id": "b",
            "title": "Masa lambası",
            "description": "Ahşap masa üzerinde duran basit bir lamba.",
            "imageUrl": "https://picsum.photos/seed/object-real-2/480/320",
        },
        {
            "id": "c",
            "title": "Kitap yığını",
            "description": "Farklı renklerde kapaklara sahip birkaç kitap.",
            "imageUrl": "https://picsum.photos/seed/object-real-3/480/320",
        },
    ],
}


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/round", response_model=RoundResponse)
def create_round(payload: RoundRequest):
    category_list = images_by_category.get(payload.category) or images_by_category["Manzara"]
    ai_index = random.randrange(len(category_list))
    items = []
    for idx, base_item in enumerate(category_list):
        items.append(
            RoundItem(
                id=base_item["id"],
                title=base_item["title"],
                description=base_item["description"],
                imageUrl=base_item["imageUrl"],
                isAi=idx == ai_index,
            )
        )
    correct_id = items[ai_index].id
    category_hints = hint_by_category.get(payload.category, [])
    difficulty_hints = hint_by_difficulty.get(payload.difficulty, [])
    combined = [*category_hints, *difficulty_hints]
    hint = combined[random.randrange(len(combined))] if combined else "Detayları incele."
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


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Müşteri Salonunun (localhost:3000) mutfağa girmesine izin veriyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mesaj": "P2P Tersine Kiralama API'si Başarıyla Çalışıyor! (Backend'den Selamlar)"}
"""
Embedding service using sentence-transformers (all-MiniLM-L6-v2, 384 dims).
Loaded once at startup; all callers import `embedding_service`.
"""
from __future__ import annotations

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None

    def _load(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model

    def encode(self, texts: str | list[str]) -> list[list[float]]:
        """Return list of embedding vectors (each is a list[float])."""
        model = self._load()
        if isinstance(texts, str):
            texts = [texts]
        vecs: np.ndarray = model.encode(texts, normalize_embeddings=True)
        return vecs.tolist()

    def encode_single(self, text: str) -> list[float]:
        return self.encode([text])[0]


embedding_service = EmbeddingService()

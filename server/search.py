from pymilvus import connections, db, utility
from pymilvus import Collection, FieldSchema, DataType
import numpy as np


def que (query: str, collection: Collection):
    text_data = [query, "ROCK"] 
    text_embed = model.get_text_embedding(text_data)
    results = collection.search(
        data=[text_embed[0]],
        anns_field="audio_embedding_spotify", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=10,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['video_url_youtube'],
        consistency_level="Strong"
    )

    return [hit.entity.get('video_url_youtube') for hits in results for hit in hits]


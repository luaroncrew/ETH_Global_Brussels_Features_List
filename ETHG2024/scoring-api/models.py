from pydantic import BaseModel
from typing import List, Dict

import json


class ENS_payload(BaseModel):
    text: str


class Comment(BaseModel):
    text: str
    creator: str


class FeatureSuggestion(BaseModel):
    title: str
    creator: str
    upVotes: int
    comments: List[Comment]


class ListItem(BaseModel):
    listId: int
    listTitle: str
    featureSuggestions: List[FeatureSuggestion]


class Payload(BaseModel):
    companyId: int
    lists: List[ListItem]

    def get_upvote_scores(self) -> List[Dict[str, float]]:
        upvote_scores = []

        for list_item in self.lists:
            for feature in list_item.featureSuggestions:
                upvote_scores.append({
                    "creator": feature.creator,
                    "score": feature.upVotes
                })

        return upvote_scores

    def to_json(self) -> str:
        # Convert the Payload instance to a JSON string representation
        return json.dumps(self.model_dump())

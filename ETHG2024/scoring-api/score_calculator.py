from models import Payload
from ai_connectors import get_comment_scores_from_ai
import numpy as np


def remove_negative_scores(scores):
    """
    removes negative scores entries
    """
    eligible_scores = {}
    for key, score in scores.items():
        if score > 0:
            eligible_scores[key] = score

    return eligible_scores


def harmonize_scores(scores):
    """
    scale logarithmically the scores going from 1 to 20
    """

    # Convert dictionary values to a numpy array
    score_values = np.array(list(scores.values()), dtype=float)

    transformed_scores = np.arcsinh(score_values)

    if np.any(np.isnan(transformed_scores)):
        raise ValueError("NaN values detected in transformed_scores")

    min_score = transformed_scores.min()
    max_score = transformed_scores.max()

    if min_score == max_score:
        # All scores are the same, set all normalized scores to a fixed value
        normalized_scores = np.ones_like(transformed_scores)
    else:
        normalized_scores = (transformed_scores - min_score) / (max_score - min_score)

    rescaled_scores = normalized_scores * 19 + 1
    harmonized_scores = {key: round(score) for key, score in zip(scores.keys(), rescaled_scores)}

    return harmonized_scores


def calculate_score(payload: Payload):
    """
       the total score consists of comments part and upVotes part
       at first, send the payload to the AI, which will give a
       score (-1; 1 range) to each comment.
        AI will respond with data in format like:
       comment_scores = [
           {"creator" : "justin.eth", "score": 1},
           {"creator" : "alice.eth", "score": -1},
           {"creator" : "bob.eth", "score": 0.25},
           {"creator" : "claire.eth", "score": 0.5},
           {"creator" : "justin.eth", "score": -0.2}
       ]

       get upvote scores

       aggregate upvote scores and AI-based comment score
       filter negative scores
       return the final scores
       """

    upvote_scores = payload.get_upvote_scores()
    comment_scores = get_comment_scores_from_ai(payload)
    print(upvote_scores)
    print(comment_scores)

    comments_coeff = 1

    for comment in comment_scores:
        comment["score"] *= comments_coeff

    final_scores = {}

    for comment in comment_scores:
        if final_scores.get(comment["creator"]) is not None:
            final_scores[comment["creator"]] += comment["score"]
        else:
            final_scores[comment["creator"]] = comment["score"]

    for feature_suggestion in upvote_scores:
        if final_scores.get(feature_suggestion["creator"]) is not None:
            final_scores[feature_suggestion["creator"]] += feature_suggestion["score"]
        else:
            final_scores[feature_suggestion["creator"]] = feature_suggestion["score"]

    final_scores = remove_negative_scores(final_scores)
    final_scores = harmonize_scores(final_scores)

    return final_scores




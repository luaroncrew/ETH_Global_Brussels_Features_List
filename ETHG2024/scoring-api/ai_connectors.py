from models import Payload


def get_comment_scores_from_ai(payload: Payload):
    """
    :return:
    """
    comment_scores = [
        {"creator": "justin.eth", "score": 1},
        {"creator": "alice.eth", "score": -1},
        {"creator": "bob.eth", "score": 0.25},
        {"creator": "claire.eth", "score": 0.5},
        {"creator": "justin.eth", "score": -0.2},
        {"creator": "spammer.eth", "score": -1},
        {"creator": "spammer.eth", "score": -1},
        {"creator": "spammer.eth", "score": -1},
        {"creator": "spammer.eth", "score": -1},
        {"creator": "spammer.eth", "score": -1},
        {"creator": "spammer.eth", "score": -1}
    ]
    return comment_scores



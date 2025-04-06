from .logging_config import LOGGER
from .resolution_status import COMMENT_PARSER_CHAIN


def parse_comments(comments):
    resolved_issues = []
    unresolved_issues = []
    orders = comments.to_dict("records")

    for i, order in enumerate(orders, 1):
        order_id = order["Transaction ID"]
        comment = order["Comments"]
        LOGGER.info("Iteration: %d, Parsing Comments for Order ID: '%d'", i, order_id)

        resolution_status = COMMENT_PARSER_CHAIN.invoke({"comment": comment}).model_dump()
        if resolution_status["is_resolved"]:
            resolved_issues.append({"order_id": order_id, "comment": comment})
        else:
            unresolved_issues.append(resolution_status)

    return resolved_issues, unresolved_issues

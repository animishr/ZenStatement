from .logging_config import LOGGER
from .resolution_status import COMMENT_PARSER_CHAIN


def parse_comments(comments):
    resolved_issues = []
    unresolved_issues = []
    orders = comments.to_dict("records")

    # Loop through orders
    for i, order in enumerate(orders, 1):
        order_id = order["Transaction ID"]
        comment = order["Comments"]
        LOGGER.info("Iteration: %d, Parsing Comments for Order ID: '%d'", i, order_id)

        # Invoke Comment Parser Chain to extract resolution status
        resolution_status = COMMENT_PARSER_CHAIN.invoke({"comment": comment}).model_dump()

        # If the LLM determines that the issue is resolved, append to 'resolved'
        # Else, append to 'unresolved'
        if resolution_status["is_resolved"]:
            resolved_issues.append({"order_id": order_id, "comment": comment})
        else:
            issue_category = resolution_status["issue_category"]
            next_steps = resolution_status["next_steps"]
            data = {"order_id": order_id, 
                    "comment": comment, 
                    "issue_category": issue_category, 
                    "next_steps": next_steps}
            unresolved_issues.append(data)

    return resolved_issues, unresolved_issues

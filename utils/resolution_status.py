from typing import List

from dotenv import load_dotenv
from langchain_community.cache import SQLiteCache
from langchain_core.globals import set_llm_cache
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.rate_limiters import InMemoryRateLimiter
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field


load_dotenv()

# Pydantic Class to make sure that 
# LLM output is in a fixed structured format

class ResolutionStatus(BaseModel):

    comment: str | None = Field(...,
        description="Comment"
    )    
    is_resolved: bool | None = Field(...,
        description="Has the issue been resolved"
    )
    issue_category: str | None = Field(
        default=None,
        description="Broad Category of the unresolved " \
        "issue"
    )
    next_steps: List[str] | None = Field(...,
        description="Next Steps to reolve the issue, "
        "if it is unresolved"
    )


# LLM Prompt
parser_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
"""
You are an expert in order resolution analysis. You are provided with a dataset of order comments associated with specific order IDs. Your task is to analyze these comments to determine the resolution status of each order and perform specific actions based on that status.

**Here's the breakdown of your responsibilities:**

1.  **Resolution Status Determination:** For each order ID, analyze the associated comments to determine if the case is "Resolved" or "Unresolved." Base your determination on the content of the comments. Look for keywords, phrases, and context indicating successful resolution (e.g., "issue fixed," "problem resolved," "customer confirmed fix," "order completed successfully"). Conversely, identify indicators of unresolved issues (e.g., "still investigating," "waiting for customer response," "issue persists," "unable to reproduce").

2.  **Action Based on Resolution Status:**

    *   **If the case is Resolved:**
        *   Identify and extract the key pattern or reason that led to the resolution. What actions were taken to resolve the issue? What specific details in the comments point to the resolution methodology? Provide a concise summary of this pattern.  This pattern identification is crucial for potentially automating the resolution of similar issues in the future.
        *   Indicate that the data for this order should be "Uploaded to Third Folder/Sent via Email" (This is a placeholder instruction for a later step).  Do NOT actually upload or send anything.  Just indicate this action.

    *   **If the case is Unresolved:**
        *   Generate a concise summary (maximum 3 sentences) explaining *why* the case is currently unresolved.  What is the outstanding issue preventing resolution?
        *   Suggest clear and actionable "Next Steps" (maximum 3 steps) that should be taken to resolve the issue.  These steps should be specific and directly address the reason for the lack of resolution.

3.  **Output Format:**

    For each Order ID, provide the following output in a structured format:

    `comment`: (str) Comment.
    `is_resolved`: (bool) Set to True if resolved. False otherwise.
    `issue_category`: (string) Set to `null` if the issue is resolved. If the case is unresolved, categorize the case into one of the following categories:
        - **Missing/Insufficient Information**: Issues where key data (e.g., payment reference, order details, transaction ID) is absent or incomplete, preventing proper reconciliation or investigation.
        - **System/Technical Errors**: Issues stemming from system malfunctions, gateway problems, or interruptions in the reconciliation process itself.
        - **Payment Discrepancies/Mismatches**: Issues where the recorded payment amount, payment reference, or other details don't match expected values or related records (e.g., orders).
        - **Awaiting External Actions/Confirmation**: Issues that require action or confirmation from external parties like customers, payment providers, or internal teams (e.g., accounting).
        - **Pending/Delayed Status**: Issues where the payment is in a temporary state (e.g., processing, pending) requiring waiting or further clarification.
    `next_steps` (list of strings): If the case is unresolved, give the next steps to resolve the issue.
"""
        ),
        (
            "user",
            "Comment: {comment}"
        )
    ]
)

# Configure the rate limiter settings
rate_limiter = InMemoryRateLimiter(requests_per_second=0.2,
                                   check_every_n_seconds=0.1,
                                   max_bucket_size=10)

# LLM instance
comment_parser_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001",
                                                 rate_limiter=rate_limiter)

# Set Prompt Cache to save on API calls
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# Lang Chain Chain object
COMMENT_PARSER_CHAIN = (parser_prompt | 
                        comment_parser_model.with_structured_output(ResolutionStatus))

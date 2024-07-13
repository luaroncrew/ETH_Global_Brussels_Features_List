import time
from datetime import datetime, timedelta

# Function to generate a Unix timestamp for a future date
def generate_future_timestamp(days_in_future):
    future_date = datetime.now() + timedelta(days=days_in_future)
    future_timestamp = int(time.mktime(future_date.timetuple()))
    return future_timestamp

# Example: Generate a timestamp for 7 days in the future
distribution_date = generate_future_timestamp(-10)
print(f'Distribution date (Unix timestamp): {distribution_date}')
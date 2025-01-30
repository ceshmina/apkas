from datetime import date, datetime

from model.diary import Diary, Location
from util.time import JST


class DiaryCore:
    def get_diary(self, diary_id: int) -> Diary | None:
        if diary_id == 1:
            return Diary(
                diary_id=1,
                date=date(2025, 1, 1),
                title='Sample diary',
                content='This is a sample diary.',
                location=Location(location_id=1, name='Tokyo, Japan'),
                created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
                updated_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
            )
        else:
            return None

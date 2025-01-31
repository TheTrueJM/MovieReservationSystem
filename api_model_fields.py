from flask_restx import fields
from datetime import datetime, date, time



class DateField(fields.Raw):
    __schema_type__ = "string"
    __schema_format__ = "date"

    date_format = "%Y-%m-%d"


    def parse(self, value):
        if value is None:
            return None
        elif isinstance(value, str):
            return datetime.strptime(value, self.date_format).date()
        elif isinstance(value, datetime):
            return value.date()
        elif isinstance(value, date):
            return value
        else:
            raise ValueError("Unsupported Date format")
    
    def format(self, value):
        try:
            value = self.parse(value)
        except (AttributeError, ValueError) as e:
            raise fields.MarshallingError(e)

    def output(self, key, obj: object, **kwargs):
        value = obj.__getattribute__(key)
        return date.strftime(value, self.date_format)


class TimeField(fields.Raw):
    __schema_type__ = "string"
    __schema_format__ = "time"

    time_format = "%H:%M:%S"


    def parse(self, value):
        if value is None:
            return None
        elif isinstance(value, str):
            return datetime.strptime(value, self.time_format).time()
        elif isinstance(value, datetime):
            return value.time()
        elif isinstance(value, time):
            return value
        else:
            raise ValueError("Unsupported Time format")
    
    def format(self, value):
        try:
            value = self.parse(value)
        except (AttributeError, ValueError) as e:
            raise fields.MarshallingError(e)

    def output(self, key, obj: object, **kwargs):
        value = obj.__getattribute__(key)
        return time.strftime(value, self.time_format)
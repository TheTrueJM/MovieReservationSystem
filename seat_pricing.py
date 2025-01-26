
from customer_types import CustomerType
from theatre_types import TheatreType


class SeatPrices:
    def __init__(self, customer: CustomerType, prices: dict[TheatreType: float]):
        if len(prices) != len(TheatreType):
            raise ValueError("All thretre types require price") ###
        
        self.customer: CustomerType = customer
        self.prices: dict[TheatreType: float] = prices

    def get_price(self, theatre: TheatreType) -> float:
        if price := self.prices.get(theatre, None):
            return price
        raise ValueError("Invalid theatre type")


class SeatingPrices:
    def __init__(self, seats: dict[CustomerType: dict[TheatreType: float]]):
        if len(seats) != len(CustomerType):
            raise ValueError("All customer types require seat prices") ###

        self.seats = {}
        for customer in seats:
            self.seats[customer] = SeatPrices(customer, seats[customer])

    def get_seat_price(self, customer: CustomerType, theatre: TheatreType) -> float:
        if seat := self.seats.get(customer, None):
            return seat.get_price(theatre)
        raise ValueError("Invalid customer type")
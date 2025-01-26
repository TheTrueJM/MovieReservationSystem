from customer_types import CustomerType
from theatre_types import TheatreType
from seat_pricing import SeatingPrices


seatingPrices = SeatingPrices({
    CustomerType.child: {
        TheatreType.standard: 10.0,
        TheatreType.premium: 15.0
    },
    CustomerType.student: {
        TheatreType.standard: 12.0,
        TheatreType.premium: 18.0
    },
    CustomerType.adult: {
        TheatreType.standard: 14.0,
        TheatreType.premium: 20.0
    },
    CustomerType.senior: {
        TheatreType.standard: 10.0,
        TheatreType.premium: 15.0
    }
})
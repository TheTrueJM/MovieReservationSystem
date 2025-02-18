export const API = "http://localhost:5000/";
export const SITE = "http://localhost:5500/";


export function dateDisplay(date) {
    let fixedDate = date.split("-");
    return `${fixedDate[2]}/${fixedDate[1]}/${fixedDate[0]}`;
}

export function timeDisplay(time) {
    let [hour, minute] = time.split(":");

    let meridiem = "am";
    if (12 <= hour) {
        meridiem = "pm";
        hour -= 12;
    }
    if (hour == 0) {hour = 12;}

    return hour + ":" + minute + meridiem;
}
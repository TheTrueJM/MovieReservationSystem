from flask import Response, jsonify, make_response



def http_response(data: dict, code: int) -> Response:
    return make_response(jsonify(data), code)



def http_ok(data: dict) -> Response:
    return http_response(data, 200)

def http_ok_message(message: str) -> Response:
    return http_response({"message": message}, 200)


def http_created(message: str) -> Response:
    return http_response({"message": message}, 201)


def http_no_content() -> Response:
    return http_response({}, 204)



def http_bad_request(message: str) -> Response:
    return http_response({"message": message}, 400)


def http_unauthorised(message: str) -> Response:
    return http_response({"message": message}, 401)
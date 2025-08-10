class FormatHelper:
    @staticmethod
    def format_response(status: str, http_status: int, message: str, data: any, meta: any):
        return {
            "status": status,
            "message": message,
            "data": data,
            "meta": meta
        }
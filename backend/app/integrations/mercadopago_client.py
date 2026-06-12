import httpx


class MercadoPagoClient:
    def __init__(self, access_token: str, base_url: str):
        self._access_token = access_token
        self._base_url = base_url

    @property
    def is_configured(self) -> bool:
        return self._access_token != ""

    async def create_preference(self, payload: dict) -> dict:
        return await self._request("POST", "/checkout/preferences", payload)

    async def get_payment(self, payment_id: str) -> dict:
        return await self._request("GET", f"/v1/payments/{payment_id}", None)

    async def _request(self, method: str, path: str, payload: dict | None) -> dict:
        headers = {"Authorization": f"Bearer {self._access_token}"}
        async with httpx.AsyncClient(base_url=self._base_url, headers=headers) as client:
            response = await client.request(method, path, json=payload)
            response.raise_for_status()
            return response.json()

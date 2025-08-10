from datetime import datetime

class DesignService:
    def __init__(self, mnmlai_provider):
        self.mnmlai_provider = mnmlai_provider

    def status_check(self, id: str) -> dict:
        response = self.mnmlai_provider.status_check(id)
        return response
    
    def exterior_ai(self, files, data):
        response = self.mnmlai_provider.generate_design_v1("exterior", files, data)
        return response
    
    def interior_ai(self, files, data):
        response = self.mnmlai_provider.generate_design_v1("interior", files, data)
        return response
    
    def enhance_render(self, files, data) -> dict:
        response = self.mnmlai_provider.generate_design_v1("render/enhancer", files, data)
        return response
    
    def style_transfer(self, files, data) -> dict:
        response = self.mnmlai_provider.generate_design_v1("style/transfer", files, data)
        return response
    
    def virtual_staging(self, files, data) -> dict:
        response = self.mnmlai_provider.generate_design_v1("virtual-staging-ai", files, data)
        return response
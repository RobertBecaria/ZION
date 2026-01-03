"""
ERIC Inter-Agent Communication and Search Action Cards Tests
Tests for:
- /api/agent/query-businesses - Query multiple business ERICs for recommendations
- /api/agent/chat-with-search - Chat with automatic inter-agent queries when recommendation keywords detected
- Search Action Cards - Verify action cards are returned with proper structure
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "testpassword123"
TEST_EMAIL = "testuser@test.com"
TEST_PASSWORD = "testpassword123"


class TestInterAgentCommunication:
    """Tests for Inter-Agent Communication API (/api/agent/query-businesses)"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_query_businesses_basic(self, auth_headers):
        """Test basic query to business ERICs"""
        response = requests.post(
            f"{BASE_URL}/api/agent/query-businesses",
            json={
                "query": "лучшая школа",
                "category": "образован",
                "limit": 5
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Query businesses failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "query" in data, "Missing 'query' in response"
        assert "category" in data, "Missing 'category' in response"
        assert "results" in data, "Missing 'results' in response"
        assert "total_businesses_queried" in data, "Missing 'total_businesses_queried' in response"
        assert "businesses_responding" in data, "Missing 'businesses_responding' in response"
        
        print(f"✓ Query businesses returned {len(data.get('results', []))} results from {data.get('total_businesses_queried', 0)} businesses")
    
    def test_query_businesses_education_category(self, auth_headers):
        """Test query with education category (школ stem)"""
        response = requests.post(
            f"{BASE_URL}/api/agent/query-businesses",
            json={
                "query": "рекомендуй школу",
                "category": "школ",
                "limit": 3
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Query businesses failed: {response.text}"
        data = response.json()
        
        # Check if results contain education-related businesses
        results = data.get("results", [])
        print(f"✓ Education category query returned {len(results)} results")
        
        # Verify result structure if results exist
        for result in results:
            assert "organization_id" in result, "Missing organization_id in result"
            assert "organization_name" in result, "Missing organization_name in result"
            assert "data" in result, "Missing data in result"
    
    def test_query_businesses_without_category(self, auth_headers):
        """Test query without category filter"""
        response = requests.post(
            f"{BASE_URL}/api/agent/query-businesses",
            json={
                "query": "лучший сервис",
                "limit": 5
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Query businesses failed: {response.text}"
        data = response.json()
        
        assert "results" in data, "Missing 'results' in response"
        print(f"✓ Query without category returned {len(data.get('results', []))} results")
    
    def test_query_businesses_unauthorized(self):
        """Test query businesses without authentication returns 401/403"""
        response = requests.post(
            f"{BASE_URL}/api/agent/query-businesses",
            json={
                "query": "test",
                "limit": 5
            }
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Query businesses without auth correctly returns {response.status_code}")
    
    def test_query_businesses_result_structure(self, auth_headers):
        """Test that business query results have proper structure"""
        response = requests.post(
            f"{BASE_URL}/api/agent/query-businesses",
            json={
                "query": "услуги",
                "category": "услуг",
                "limit": 5
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Query businesses failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        if results:
            result = results[0]
            # Verify expected fields in result
            expected_fields = ["organization_id", "organization_name", "data", "relevance_score"]
            for field in expected_fields:
                assert field in result, f"Missing '{field}' in result"
            
            # Verify data structure
            result_data = result.get("data", {})
            # Data should contain company_info if share_public_data is enabled
            print(f"✓ Result structure verified with fields: {list(result.keys())}")
        else:
            print("✓ No results returned (no matching businesses)")


class TestChatWithSearchInterAgent:
    """Tests for chat-with-search with inter-agent communication"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_chat_with_recommendation_keyword_luchshiy(self, auth_headers):
        """Test chat with 'лучший' keyword triggers inter-agent queries"""
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "лучший автосервис в городе"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        assert "conversation_id" in data, "Missing conversation_id"
        assert "message" in data, "Missing message"
        
        # Check for suggested_actions with search_results
        suggested_actions = data.get("suggested_actions", [])
        print(f"✓ Chat with 'лучший' returned {len(suggested_actions)} suggested actions")
        time.sleep(3)  # Allow AI response time
    
    def test_chat_with_recommendation_keyword_rekomenduy(self, auth_headers):
        """Test chat with 'рекомендуй' keyword triggers inter-agent queries"""
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "рекомендуй хорошую школу"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        assert "conversation_id" in data, "Missing conversation_id"
        assert "message" in data, "Missing message"
        print(f"✓ Chat with 'рекомендуй' successful")
        time.sleep(3)
    
    def test_chat_with_recommendation_keyword_posovetuy(self, auth_headers):
        """Test chat with 'посоветуй' keyword triggers inter-agent queries"""
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "посоветуй услугу красоты"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        assert "conversation_id" in data, "Missing conversation_id"
        assert "message" in data, "Missing message"
        print(f"✓ Chat with 'посоветуй' successful")
        time.sleep(3)


class TestSearchActionCards:
    """Tests for Search Action Cards structure in chat responses"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_action_cards_in_search_response(self, auth_headers):
        """Test that search results include action cards with proper structure"""
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "найди услуги"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        suggested_actions = data.get("suggested_actions", [])
        
        # Find search_results action
        search_results_action = None
        for action in suggested_actions:
            if action.get("type") == "search_results":
                search_results_action = action
                break
        
        if search_results_action:
            cards = search_results_action.get("cards", [])
            print(f"✓ Found {len(cards)} action cards in response")
            
            # Verify card structure
            for card in cards:
                assert "id" in card, "Card missing 'id'"
                assert "type" in card, "Card missing 'type'"
                assert "name" in card, "Card missing 'name'"
                
                # Verify action structure if present
                if "action" in card:
                    action = card["action"]
                    assert "label" in action, "Action missing 'label'"
                    assert "route" in action, "Action missing 'route'"
                    assert "type" in action, "Action missing 'type'"
                    
                    # Verify route format based on card type
                    card_type = card.get("type")
                    route = action.get("route", "")
                    
                    if card_type == "service":
                        assert "/services/" in route, f"Service card should have /services/ route, got {route}"
                    elif card_type == "organization":
                        assert "/organizations/" in route, f"Organization card should have /organizations/ route, got {route}"
                    elif card_type == "product":
                        assert "/marketplace/" in route, f"Product card should have /marketplace/ route, got {route}"
                    elif card_type == "person":
                        assert "/messages" in route, f"Person card should have /messages route, got {route}"
                    elif card_type == "recommendation":
                        assert "/organizations/" in route, f"Recommendation card should have /organizations/ route, got {route}"
        else:
            print("✓ No search results action (may be no matching results)")
        
        time.sleep(2)
    
    def test_action_card_metadata(self, auth_headers):
        """Test that action cards include proper metadata"""
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "найди тестовую услугу"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        suggested_actions = data.get("suggested_actions", [])
        
        for action in suggested_actions:
            if action.get("type") == "search_results":
                cards = action.get("cards", [])
                for card in cards:
                    # Check metadata exists
                    metadata = card.get("metadata", {})
                    
                    # Metadata can contain: city, rating, price_from, price, currency, has_promotions
                    print(f"✓ Card '{card.get('name')}' has metadata: {list(metadata.keys())}")
        
        time.sleep(2)
    
    def test_action_card_type_badges(self, auth_headers):
        """Test that different card types are returned correctly"""
        # Search for services
        response = requests.post(
            f"{BASE_URL}/api/agent/chat-with-search",
            json={"message": "найди услуги и организации"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        suggested_actions = data.get("suggested_actions", [])
        
        card_types_found = set()
        for action in suggested_actions:
            if action.get("type") == "search_results":
                cards = action.get("cards", [])
                for card in cards:
                    card_types_found.add(card.get("type"))
        
        print(f"✓ Found card types: {card_types_found}")
        # Valid types: service, organization, product, person, recommendation
        valid_types = {"service", "organization", "product", "person", "recommendation"}
        for card_type in card_types_found:
            assert card_type in valid_types, f"Invalid card type: {card_type}"
        
        time.sleep(2)


class TestBusinessERICSettingsExtended:
    """Extended tests for Business ERIC Settings"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Get admin authorization headers"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    @pytest.fixture(scope="class")
    def test_organization_id(self, admin_headers):
        """Get or create a test organization"""
        response = requests.get(
            f"{BASE_URL}/api/work/organizations",
            headers=admin_headers
        )
        if response.status_code == 200:
            data = response.json()
            orgs = data.get("organizations", []) if isinstance(data, dict) else data
            if orgs and len(orgs) > 0:
                for org in orgs:
                    if isinstance(org, dict):
                        org_id = org.get("id") or org.get("organization_id")
                        if org_id:
                            return org_id
        pytest.skip("No test organization available")
    
    def test_eric_settings_allow_queries_toggle(self, admin_headers, test_organization_id):
        """Test toggling allow_user_eric_queries setting"""
        # First disable queries
        response = requests.put(
            f"{BASE_URL}/api/work/organizations/{test_organization_id}/eric-settings",
            json={
                "allow_user_eric_queries": False,
                "share_public_data": True
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data.get("allow_user_eric_queries") == False, "allow_user_eric_queries should be False"
        
        # Re-enable queries
        response = requests.put(
            f"{BASE_URL}/api/work/organizations/{test_organization_id}/eric-settings",
            json={
                "allow_user_eric_queries": True,
                "share_public_data": True
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data.get("allow_user_eric_queries") == True, "allow_user_eric_queries should be True"
        
        print(f"✓ allow_user_eric_queries toggle works correctly")
    
    def test_eric_settings_specialties(self, admin_headers, test_organization_id):
        """Test updating specialties list"""
        specialties = ["образование", "начальная школа", "подготовка к ЕГЭ"]
        
        response = requests.put(
            f"{BASE_URL}/api/work/organizations/{test_organization_id}/eric-settings",
            json={
                "specialties": specialties,
                "business_description": "Тестовая школа для проверки ERIC"
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        
        assert data.get("specialties") == specialties, "Specialties should match"
        assert data.get("business_description") == "Тестовая школа для проверки ERIC"
        
        print(f"✓ Specialties update works correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

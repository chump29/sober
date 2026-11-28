Feature: API tests

Scenario: Stringify a SubstanceDTO
	Given that a SubstanceDTO should stringify
		When a SubstanceDTO is output
		Then SubstanceDTO should be a string

Scenario: Get cache stats
	Given that a user wants cache stats
		When /cache API endpoint is called
		Then cache stats are returned

Scenario: Clear cache stats
	Given that a user wants to clear cache stats
		When /cache/clear API endpoint is called
		Then Cache cleared is returned

Scenario: Get version
	Given a request for the version
		When /version API endpoint is called
		Then port "5560" is used
			And version is returned
			And version is cached

Scenario: Create user
	Given that a user wants to create a user record
		When /user API endpoint is called (create)
		Then user data is created

Scenario: Get user
	Given that a user wants to get a user record from cache
		When /user API endpoint is called (get)
		Then user data is found in cache

Scenario: Evict user
		Given that a user is evicted from cache
			When /user/evict API endpoint is called
			Then user data is not found in cache

Scenario: Delete user by ID
	Given that a user wants to delete a user record by ID
		When /user/delete API endpoint is called with an ID
		Then user data is deleted

Scenario: Add substance
	Given that a user wants to add a substance record
		When /substances/add API endpoint is called
		Then new substance is returned

Scenario: Get substances
	Given that a user wants substance records
		When /substances API endpoint is called
		Then substances are returned
			And substances are cached

Scenario: Get substance by ID
	Given that a user wants a substance by ID
		When /substances/get API endpoint is called with an ID
		Then substance is returned

Scenario: Update substance by ID
	Given that a user wants to update a substance by ID
		When /substances/update API endpoint is called with an ID
		Then updated substance is returned

Scenario: Delete substance by ID
	Given that a user wants to delete a substance by ID
		When /substance/delete API endpoint is called with an ID
		Then substance is deleted

Scenario: Get favicon
	Given that a browser makes a request for favicon
		When /favicon.ico API endpoint is called
		Then Nothing is returned

Scenario: Reject unauthenticated and invalid JWT requests
	Given an HTTP test client
		When /api/user is called without a token
		Then HTTP status 401 is returned
		When /api/user is called with an invalid token
		Then HTTP status 401 is returned

Scenario: Create and fetch user via HTTP
	Given an HTTP test client
		When /api/user is called via HTTP (first time)
		Then HTTP status 201 is returned
		When /api/user is called via HTTP (second time)
		Then HTTP status 204 is returned

Scenario: Enforce per-user unique substance name and reject future dates
	Given an HTTP test client
		When a substance is added via HTTP
		Then HTTP status 201 is returned
		When the same substance name is added again for the same user via HTTP
		Then HTTP status 400 is returned
		When the same substance name is added for another user via HTTP
		Then HTTP status 201 is returned
		When a substance with a future date is added via HTTP
		Then HTTP status 422 is returned

Scenario: Return 404 for missing or cross-user substances
	Given an HTTP test client
		When a substance is added via HTTP
		Then HTTP status 201 is returned
		When another user requests the created substance via HTTP
		Then HTTP status 404 is returned
		When another user updates the created substance via HTTP
		Then HTTP status 404 is returned
		When another user deletes the created substance via HTTP
		Then HTTP status 404 is returned

Scenario: Get empty substances via HTTP
	Given an HTTP test client
		When /api/substances is called via HTTP for a user with no substances
		Then HTTP status 200 is returned
			And JSON response is null

Scenario: Delete user via HTTP
	Given an HTTP test client
		When /api/user/delete is called via HTTP for a nonexistent user
		Then HTTP status 404 is returned
		When /api/user is called via HTTP (first time)
		Then HTTP status 201 is returned
		When /api/user/delete is called via HTTP for that user
		Then HTTP status 204 is returned

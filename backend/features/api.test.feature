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

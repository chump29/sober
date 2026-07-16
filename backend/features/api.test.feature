Feature: API tests

Scenario: Get user
		Given that a user wants a user record
			When /user API endpoint is called
			Then user data is returned

Scenario: Update user
	Given that a user wants to update a user record
		When /user/update API endpoint is called with data
		Then user data is updated

Scenario: Add substance
	Given that a user wants to add a substance record
		When /substances/add API endpoint is called
		Then new substance is returned

Scenario: Get all substances
	Given that a user wants all substance records
		When /substances API endpoint is called
		Then all substances are returned

Scenario: Get substance by ID
	Given that a user wants a substance by ID
		When /substances/get API endpoint is called with an ID
		Then substance is returned

Scenario: Delete substance by ID
	Given that a user wants to delete a substance by ID
		When /substance/delete API endpoint is called with an ID
		Then substance is deleted

Scenario: Update substance by ID
	Given that a user wants to update a substance by ID
		When /substances/update API endpoint is called with an ID
		Then updated substance is returned

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

Scenario: Stringify a UserDTO
	Given that a UserDTO should stringify
		When a UserDTO is output
		Then UserDTO should be a string

Scenario: Stringify a SubstanceDTO
	Given that a SubstanceDTO should stringify
		When a SubstanceDTO is output
		Then SubstanceDTO should be a string

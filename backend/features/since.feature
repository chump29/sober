@since
Feature: Get sober date
  Scenario: Get sober date
    Given that a user wants their sober date
      When /since API endpoint is called with a date
      Then JSON data is returned
        And the date matches

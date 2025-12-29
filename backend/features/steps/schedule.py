#!/usr/bin/env python3

# pylint: skip-file

from datetime import datetime

from behave import given, when, then

from api import since


SOBER_DATE = "2025-01-01"


@given("that a user wants their sober date")
def step_impl(context):
    context.since = None
    pass


@when("/since API endpoint is called with a date")
async def step_impl(context):
    context.since = await since(SOBER_DATE)
    assert context.failed is not True, "/since call failed"


@then("JSON data is returned")
def step_impl(context):
    assert len(context.since) > 0, "Empty JSON response"


@then("the date matches")
def step_impl(context):
    assert context.since["since"] == SOBER_DATE

# ============================================================
#  SauceDemo End-to-End BDD Feature File
#  Covers: Login → Add to Cart → Checkout → Purchase → Logout
#
#  Tags (TestNG group equivalent):
#    @smoke      — fast, critical-path check
#    @regression — full end-to-end flow
#    @sanity     — quick sanity after deployment
#
#  Excel row requirement:
#    Each <testId> below must exist in sheet "E2E_Tests" with active="yes".
# ============================================================

Feature: SauceDemo E2E Purchase Journey
  As a registered SauceDemo user
  I want to log in, add products to my cart, complete a purchase and log out
  So that I can verify the full end-to-end shopping flow works correctly

  Background:
    Given the SauceDemo login page is displayed

  # ── Scenario 1: Smoke — Login only ──────────────────────────────────────
  @smoke @sanity
  Scenario Outline: User can log in successfully with test data "<testId>"
    Given I load test data from sheet "E2E_Tests" with id "<testId>"
    When I log in with username "$username" and password "$password"
    Then I should see the product inventory page
    And I log out of the application

    Examples:
      | testId  |
      | TC_SMOKE_VALID_001  |

  # ── Scenario 2: Smoke — Login failure ───────────────────────────────────
  @smoke
  Scenario Outline: User sees error with invalid credentials from test data "<testId>"
    Given I load test data from sheet "E2E_Tests" with id "<testId>"
    When I log in with username "$username" and password "$password"
    Then I should see an error message on the login page

    Examples:
      | testId  |
      | TC_SMOKE_INVALID_001  |

  # ── Scenario 3: Regression — Full purchase flow (Excel-driven) ──────────
  @regression
  Scenario Outline: Complete end-to-end purchase journey with test data "<testId>"
    Given I load test data from sheet "E2E_Tests" with id "<testId>"
    When I log in with username "$username" and password "$password"
    Then I should see the product inventory page
    When I add the product "$productName" to the cart
    Then the cart badge should show 1 item
    When I proceed to the shopping cart
    Then the cart should contain the added product
    When I proceed to checkout
    And I fill in the checkout form with first name "$firstName", last name "$lastName" and postal code "$postalCode"
    And I confirm the order on the overview page
    Then the purchase should be confirmed with a thank you message
    And I log out of the application

    Examples:
      | testId  |
      | TC_REGRESSION_E2E_001  |
      | TC_REGRESSION_E2E_002  |

  # ── Scenario 4: Sanity — Add to cart and verify badge ───────────────────
  @sanity @smoke
  Scenario Outline: Cart badge updates correctly with test data "<testId>"
    Given I load test data from sheet "E2E_Tests" with id "<testId>"
    When I log in with username "$username" and password "$password"
    Then I should see the product inventory page
    When I add the product "$productName" to the cart
    Then the cart badge should show 1 item
    And I log out of the application

    Examples:
      | testId  |
      | TC_SANITY_CART_001  |

  # ── Scenario 5: Regression — Checkout form validation ───────────────────
  @regression
  Scenario Outline: Checkout form shows error when fields are empty for test data "<testId>"
    Given I load test data from sheet "E2E_Tests" with id "<testId>"
    When I log in with username "$username" and password "$password"
    Then I should see the product inventory page
    When I add the product "$productName" to the cart
    And I proceed to the shopping cart
    And I proceed to checkout
    And I submit the checkout form without filling any fields
    Then the checkout form should show a validation error

    Examples:
      | testId  |
      | TC_REGRESSION_CHECKOUT_EMPTY_001  |

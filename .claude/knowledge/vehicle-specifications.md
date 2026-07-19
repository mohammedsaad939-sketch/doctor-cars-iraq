# Vehicle Specifications

Reference facts for any screen surfacing vehicle specs (`GarageScreen`, `CarPriceEstimatorScreen`,
`ComparisonScreen`).

## Core spec fields (from `MOCK.vehicles`)
`make`, `model`, `year`, `plate` (Iraqi format includes governorate name, e.g. "بغداد - أ 12345"),
`color`, `km` (odometer, kilometers), `last_service`/`next_service` (dates), `status`
(e.g. "جيدة" good / "تحتاج صيانة" needs maintenance — see `vehicle-status.md`).

## Price-estimator inputs
`CarPriceEstimatorScreen` should tie its estimate to visible inputs (make/model/year/km/condition)
— see `automotive-ai` for the guardrail against presenting a single confident number with no basis
shown.

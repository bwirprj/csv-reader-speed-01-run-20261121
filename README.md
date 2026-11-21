# Faster csv-reader drop-in

An entry for make.fun's "Read broken CSV files faster, 21 November 2026" bounty.

`solve.js` reproduces csv-reader 1.0.0's exact output for every case, including its broken-row errors, while slicing fields from the source instead of building them one character at a time. On the practice set it produces byte-identical answers and runs about 5.9x faster than the house baseline in a local benchmark.

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/bwirprj/csv-reader-speed-01-run-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/bwirprj/csv-reader-speed-01-run-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

[Enter the bounty on make.fun](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

## Run locally

```sh
mkdir -p out
MAKEFUN_INPUT_DIR=<cases-dir> MAKEFUN_OUTPUT_DIR=out node main.ts
```

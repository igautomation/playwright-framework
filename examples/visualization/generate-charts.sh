#!/bin/bash

# Create output directory
mkdir -p reports/charts

# Generate bar chart
echo "Generating bar chart..."
node src/cli/visualize.js bar examples/visualization/sample-data.json \
  -x Name -y Price -t "Product Prices" \
  -o product-prices

# Generate pie chart
echo "Generating pie chart..."
node src/cli/visualize.js pie examples/visualization/category-data.json \
  -l Category -v Count -t "Category Distribution" \
  -o category-distribution

# Generate line chart
echo "Generating line chart..."
node src/cli/visualize.js line examples/visualization/time-series-data.json \
  -x Date -y Stock,Sales -t "Stock and Sales Over Time" \
  -o time-series

# Generate table image
echo "Generating table image..."
node src/cli/visualize.js table examples/visualization/sample-data.json \
  -c "Name,Price,Category,Rating" -t "Product List" \
  -o product-table

# Generate statistics
echo "Generating statistics..."
node src/cli/visualize.js stats examples/visualization/sample-data.json \
  -c "Price,Rating,Stock" -o examples/visualization/product-stats.json

# Generate report
echo "Generating report..."
node src/cli/visualize.js report examples/visualization/sample-data.json \
  -c examples/visualization/report-config.json -t "Product Analysis Report" \
  -o product-report

echo "All charts generated in reports/charts directory"
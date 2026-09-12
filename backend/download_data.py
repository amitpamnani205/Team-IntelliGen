import urllib.request
import json

url = "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=45.0&lon=8.0&startyear=2019&endyear=2020&pvcalculation=1&peakpower=50&loss=14&outputformat=csv"
print("Downloading from PVGIS...")
urllib.request.urlretrieve(url, "backend/data/raw/pvgis_data.csv")
print("Download complete.")

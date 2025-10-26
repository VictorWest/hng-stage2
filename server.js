import express from 'express'
import { generateSummaryImage, getRandomIntRange, getSummaryData, retrieveCountriesFromDB, saveCountryToDB } from './helpers.js'
import { query } from './database.js'
import path from "path";
import fs from "fs";

const app = express()
const port = 3000

const COUNTRY_DATA_URL = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD"

app.post('/countries/refresh', async (req, res) => {
    try {
        const countryResponse = await fetch(COUNTRY_DATA_URL)
        const exchangeRateResponse = await fetch(EXCHANGE_RATE_URL)
    
        if (!countryResponse.ok) {
          return res.status(503).json({ 
            error: "External data source unavailable", 
            details: "Could not fetch data from RestCountries API" 
          });
        }
    
        if (!exchangeRateResponse.ok) {
          return res.status(503).json({ 
            error: "External data source unavailable", 
            details: "Could not fetch data from Exchange Rate API" 
          });
        }
    
        const countryData = await countryResponse.json()
        const exchangeRateData = await exchangeRateResponse.json()
        let refinedCountryData = []
    
        countryData.forEach(country => {
            let exchangeRate 
            let currencyCode
            let estimatedGdp
    
            if (!country.currencies || country.currencies.length < 1){
                currencyCode = exchangeRate = null
                estimatedGdp = 0
            } else {
                currencyCode = country.currencies[0].code
                exchangeRate = exchangeRateData.rates[currencyCode]
    
                if (!exchangeRate){
                    exchangeRate = estimatedGdp = null
                } else {
                    estimatedGdp = country.population * getRandomIntRange(1000, 2000) / exchangeRate
                }
            }
            const { independent, currencies, ...restOfCountryData } = country
            refinedCountryData.push({
                ...restOfCountryData,
                estimatedGdp,
                exchangeRate,
                currencyCode
            })
        });
        refinedCountryData.forEach(country => {
            saveCountryToDB(country)
        })
        const summary = await getSummaryData()
        await generateSummaryImage(summary)
        
        res.status(200).json({
            message: "Countries refreshed successfully",
            total_countries: summary.totalCountries,
            last_refreshed_at: summary.lastRefreshedAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get('/countries', async (req, res) => {
    try {
        const { region, currency, sort } = req.query;

        const countries = await retrieveCountriesFromDB(region, currency, sort);

        res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get("/countries/image", (req, res) => {
    const filePath = path.join(process.cwd(), "cache", "summary.png");
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Summary image not found" });
    }
    res.sendFile(filePath);
});

app.get('/countries/:name', async (req, res) => {
    try {
        const { name } = req.params;

        const sql = "SELECT * FROM countries WHERE LOWER(name) = LOWER(?) LIMIT 1";
        const values = [name];

        const rows = await query(sql, values);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Country not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching country:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.delete("/countries/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const sql = "DELETE FROM countries WHERE LOWER(name) = LOWER(?)";
    const result = await query(sql, [name]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.status(200).json({ message: `Country '${name}' deleted successfully` });
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/status", async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) AS total_countries,
        MAX(last_refreshed_at) AS last_refreshed_at
      FROM countries
    `;

    const [status] = await query(sql);

    res.status(200).json({
      total_countries: status.total_countries || 0,
      last_refreshed_at: status.last_refreshed_at
        ? new Date(status.last_refreshed_at).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
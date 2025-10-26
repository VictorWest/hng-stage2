import { query } from "./database.js";
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

export function getRandomIntRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function retrieveCountriesFromDB( region, currency, sort) {
  try {
    let sql = "SELECT * FROM countries";
    const conditions = [];
    const values = [];

    if (region) {
      conditions.push("region = ?");
      values.push(region);
    }

    if (currency) {
      conditions.push("currency_code = ?");
      values.push(currency);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    if (sort) {
      if (sort.toLowerCase() === "gdp_desc") sql += " ORDER BY estimated_gdp DESC";
      else if (sort.toLowerCase() === "gdp_asc") sql += " ORDER BY estimated_gdp ASC";
    }

    const rows = await query(sql, values);
    return rows;
  } catch (error) {
    console.error("Error retrieving countries:", error);
    throw error;
  }
}


export async function saveCountryToDB(country) {
  try {
    const checkSql = `SELECT * FROM countries WHERE LOWER(name) = LOWER(?)`;
    const existing = await query(checkSql, [country.name]) || null;

    if (existing.length > 0) {
      const newEstimatedGdp = country.estimatedGdp * (0.9 + Math.random() * 0.2); // random 0.9–1.1 multiplier
      const updateSql = `
        UPDATE countries 
        SET capital = ?, region = ?, population = ?, currency_code = ?, 
            exchange_rate = ?, estimated_gdp = ?, flag_url = ?
        WHERE LOWER(name) = LOWER(?)
      `;
      const updateValues = [
        country.capital || null,
        country.region || null,
        country.population,
        country.currencyCode,
        country.exchangeRate,
        newEstimatedGdp,
        country.flag || null,
        country.name
      ];

      await query(updateSql, updateValues);
      console.log(`Updated ${country.name}`);
    } 
    else {
      const insertSql = `
        INSERT INTO countries 
        (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertValues = [
        country.name,
        country.capital || null,
        country.region || null,
        country.population,
        country.currencyCode,
        country.exchangeRate,
        country.estimatedGdp,
        country.flag || null
      ];

      await query(insertSql, insertValues);
      console.log(`Inserted ${country.name}`);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getSummaryData() {
  const totalResult = await query("SELECT COUNT(*) AS count FROM countries");
  const total = totalResult[0];
  const top5 = await query("SELECT name, estimated_gdp FROM countries ORDER BY estimated_gdp DESC LIMIT 5");
  const lastResult = await query("SELECT MAX(last_refreshed_at) AS last_refreshed_at FROM countries");
  const last = lastResult[0];

  return {
    totalCountries: total.count,
    top5Countries: top5,
    lastRefreshedAt: last.last_refreshed_at,
  };
}

export async function generateSummaryImage(summary) {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#020916";
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.fillText("🌍 Country Summary", 20, 50);

  // Total countries
  ctx.font = "20px Arial";
  ctx.fillText(`Total Countries: ${summary.totalCountries}`, 20, 100);

  // Top 5 by GDP
  ctx.fillText("Top 5 Countries by Estimated GDP:", 20, 150);
  summary.top5Countries.forEach((c, i) => {
    ctx.fillText(`${i + 1}. ${c.name} — ${c.estimated_gdp}`, 40, 180 + i * 30);
  });

  // Timestamp
  ctx.font = "16px Arial";
  ctx.fillStyle = "#aaa";
  ctx.fillText(`Last refreshed: ${summary.lastRefreshedAt}`, 20, height - 30);

  // Save image
  const outDir = path.join(process.cwd(), "cache");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const filePath = path.join(outDir, "summary.png");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  console.log(`Summary image saved to ${filePath}`);
}

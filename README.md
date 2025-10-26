# 🌍 Country Currency & Exchange API

A RESTful API built with **Node.js**, **Express**, and **MySQL**, designed to manage country data, including currency, population, exchange rate, and estimated GDP.  
It also generates a visual summary image showing key global statistics.

---

## 🚀 Features

- Fetches and stores real-world data from [RestCountries API](https://restcountries.com/) and [ExchangeRate API](https://open.er-api.com/).
- Maintains a MySQL database of countries with up-to-date exchange rates and estimated GDP values.
- Generates an image summary (`cache/summary.png`) displaying:
  - Total countries stored  
  - Top 5 countries by estimated GDP  
  - Timestamp of last refresh  
- Supports full CRUD operations for country records.
- Provides clean filtering and sorting options.
- Exposes status and summary endpoints.

---

## 🧱 Project Structure

```
project-root/
├── cache/
│   └── summary.png         # Auto-generated summary image
├── db/
│   └── database.sql        # Table definition
├── src/
│   ├── app.js              # Express server setup
│   ├── db.js               # MySQL connection logic
│   ├── routes/
│   │   └── countries.js    # All country endpoints
│   ├── utils/
│   │   ├── image.js        # Canvas image generator
│   │   └── helpers.js      # Reusable utilities
├── .env                    # Environment variables (optional)
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/country-currency-api.git
cd country-currency-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Create a MySQL database and run the following table schema:

```sql
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  capital VARCHAR(255),
  region VARCHAR(255),
  population BIGINT,
  flag VARCHAR(500),
  currency_code VARCHAR(10),
  exchange_rate FLOAT,
  estimated_gdp DOUBLE,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=country_db
PORT=3000
```

### 5. Run Server

```bash
npm start
```

The API will start on:
👉 `http://localhost:3000`

---

## 🌐 API Endpoints

### 🧭 1. `POST /countries/refresh`

Fetches new data from external APIs, saves countries to the database, and regenerates the summary image.

**Response:**

```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 195,
  "last_refreshed_at": "2025-10-26T14:03:22.000Z"
}
```

---

### 📋 2. `GET /countries`

Retrieves all countries. Supports query filters.

**Query Params:**

| Parameter | Description                                              |
| --------- | -------------------------------------------------------- |
| `region`  | Filter by region (e.g., Europe)                          |
| `sort`    | Sort by population or GDP (e.g., `sort=population_desc`) |

**Example:**

```
GET /countries?region=Asia&sort=gdp_desc
```

---

### 🧾 3. `GET /countries/:name`

Fetch a specific country by name.

**Example:**

```
GET /countries/Nigeria
```

**Response:**

```json
{
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1500.45,
  "estimated_gdp": 283450000000.23,
  "flag": "https://flagcdn.com/w320/ng.png"
}
```

---

### 🗑️ 4. `DELETE /countries/:name`

Delete a country record by name.

**Example:**

```
DELETE /countries/Ghana
```

**Response:**

```json
{ "message": "Country deleted successfully" }
```

---

### 📊 5. `GET /status`

Displays overall statistics of the dataset.

**Response:**

```json
{
  "total_countries": 195,
  "last_refreshed_at": "2025-10-26T14:03:22.000Z"
}
```

---

### 🖼️ 6. `GET /countries/image`

Serves the cached summary image (`cache/summary.png`) generated after each refresh.

Open directly in your browser:

```
http://localhost:3000/countries/image
```

---

## 🧠 Summary Image Example

When `/countries/refresh` runs successfully, a new image is generated at:

```
cache/summary.png
```

It includes:

* Total number of countries
* Top 5 countries by GDP
* Last refresh timestamp

*(Generated using [node-canvas](https://www.npmjs.com/package/canvas))*

---

## 🔧 Utilities

### `getSummaryData()`

Retrieves:

* Total countries
* Top 5 by GDP
* Last refresh timestamp

### `generateSummaryImage(summary)`

Creates a summary PNG showing dataset statistics.

---

## 🧩 Technologies Used

* **Node.js** — Server runtime
* **Express** — API framework
* **MySQL** — Database
* **node-canvas** — Image generation
* **dotenv** — Environment variables
* **fetch API** — External data fetching

---

## 📈 Example Workflow

1. Run server (`npm start`)
2. Call `POST /countries/refresh` to fetch and populate data.
3. View database contents using `GET /countries`.
4. Check status with `GET /status`.
5. View visual summary via `GET /countries/image`.

---

## 🧰 Error Handling

| Error                              | HTTP Code | Description                       |
| ---------------------------------- | --------- | --------------------------------- |
| `External data source unavailable` | 503       | Failed to fetch external API      |
| `Internal server error`            | 500       | Unexpected runtime error          |
| `Not found`                        | 404       | Record or image not found         |
| `Bad request`                      | 400       | Validation failed or missing data |

---

## 🧑‍💻 Developer Notes

* You can adjust GDP estimation logic in `/utils/helpers.js`.
* To reset all records, run:

  ```sql
  TRUNCATE TABLE countries;
  ```
* The app automatically updates the `last_refreshed_at` field each time data is refreshed.

---

## 📜 License

MIT License © 2025 — [Your Name or Organization]

---

## 💡 Acknowledgments

* [RestCountries API](https://restcountries.com/)
* [Exchange Rate API](https://open.er-api.com/)
* [node-canvas](https://www.npmjs.com/package/canvas)
* [Express](https://expressjs.com/)
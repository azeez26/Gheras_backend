# Adding data to Gheras

This guide follows the schemas in `models/` and the create handlers in `controllers/`. The examples are JSON-shaped documents suitable for preparing import files. For MongoDB Extended JSON, encode IDs as `{ "$oid": "..." }` and dates as `{ "$date": "2026-10-13T00:00:00.000Z" }`. Replace every sample ID with an ID that exists in your database.

## Importing and references

Import with MongoDB Compass (Import Data → JSON) or `mongoimport` against the database selected by `MONGO_URI` in `backend/.env`. Each file should contain one JSON object per document (JSON Lines/NDJSON) or a JSON array, depending on the importer option. Use the collection names created by Mongoose: `categories`, `products`, `plants`, `fertilizers`, `diseases`, `blogs`, `posts`, `comments`, and `userplants`.

Import referenced records first. A practical order is users (created through the user flow), categories, plants, then fertilizers and diseases, followed by products and blogs. Posts and comments require user IDs; `UserPlant` requires both user and plant IDs. MongoDB does not enforce Mongoose `ref` relationships during a raw import, so a bad reference can import successfully and later fail to populate. The API create handlers for plants/fertilizers/diseases also synchronize both sides of their references; raw imports do not. Include the matching IDs in both arrays when importing directly.

For raw imports, omit `createdAt`/`updatedAt` to let Mongoose fill them only when writing through the API; MongoDB imports do not run Mongoose timestamps, defaults, validators, or middleware. Include values such as `isActive`, `isPublished`, and `status` explicitly when the intended value differs from the schema default.

## Document shapes

### Category (`categories`)

Required: `name`, unique `slug`. Optional: `description`, `image`, `isActive` (defaults to `true`).

```json
{
  "name": "Indoor Plants",
  "slug": "indoor-plants",
  "description": "Plants suitable for indoor spaces",
  "image": "uploads/indoor-plants.jpg",
  "isActive": true
}
```

### Plant (`plants`)

Required: `commonName`, `scientificName`, `family`. `temperatureRange` and `soilPH` are `{min,max}` objects; `waterNeeds` is `{level,frequency}` where frequency is days. `images` is an array of strings. `fertilizers` and `diseases` contain ObjectIds. `potSizeOptions` entries have `plantType`, `min`, `max`, and optional `unit` (defaults to `cm`). `growthStages` entries require `name` and `durationInDays`.

```json
{
  "commonName": "Basil",
  "scientificName": "Ocimum basilicum",
  "family": "Lamiaceae",
  "description": "An aromatic culinary herb.",
  "images": ["uploads/basil-1.jpg"],
  "growingSeason": "Spring to summer",
  "temperatureRange": { "min": 18, "max": 30 },
  "sunlightHours": 6,
  "soilPH": { "min": 6, "max": 7.5 },
  "waterNeeds": { "level": "Moderate", "frequency": 3 },
  "nutritionalValue": "Leaves are commonly used fresh.",
  "fertilizers": [{ "$oid": "650000000000000000000002" }],
  "diseases": [{ "$oid": "650000000000000000000003" }],
  "potSizeOptions": [{ "plantType": "Herb", "min": 15, "max": 25, "unit": "cm" }],
  "growthStages": [
    { "name": "Seedling", "durationInDays": 14, "description": "Establishes roots and first leaves." },
    { "name": "Mature", "durationInDays": 45, "description": "Ready for regular leaf harvest." }
  ]
}
```

### Fertilizer (`fertilizers`)

Required: `name`, `type`; `composition` entries require `element` and numeric `percentage`; `benefits` is an array of strings. Optional: `image`, `applicationMethod`, `applicationRate`, and `suitablePlants` (Plant IDs).

```json
{
  "name": "Balanced NPK 10-10-10",
  "type": "Granular",
  "image": "uploads/npk.jpg",
  "composition": [
    { "element": "Nitrogen", "percentage": 10 },
    { "element": "Phosphorus", "percentage": 10 },
    { "element": "Potassium", "percentage": 10 }
  ],
  "benefits": ["Supports balanced vegetative growth"],
  "applicationMethod": "Mix into soil",
  "applicationRate": "Follow package directions",
  "suitablePlants": [{ "$oid": "650000000000000000000001" }]
}
```

### Disease (`diseases`)

Required: `name`, `pathogenType`, `symptoms` (string array), `prevention` (string array). Optional: `scientificName`, `image`, `favorableConditions`, `treatment` (string array), `affectedPlants` (Plant IDs).

```json
{
  "name": "Powdery mildew",
  "scientificName": "Various fungi",
  "image": "uploads/powdery-mildew.jpg",
  "pathogenType": "Fungal",
  "symptoms": ["White powdery patches on leaves"],
  "favorableConditions": "Warm days, cool nights, and poor air circulation",
  "prevention": ["Improve airflow", "Avoid wetting foliage"],
  "treatment": ["Remove heavily affected leaves"],
  "affectedPlants": [{ "$oid": "650000000000000000000001" }]
}
```

### Product (`products`)

Required: `name`, `description`, `category` (Category ID), `price` (number). `costPrice` and `stock` default to `0`; `discountPercent` defaults to `0` and must be 0–100. Optional: `finalPrice`, `images` (string array), `relatedProducts` (Product IDs), `isActive` (defaults true). The model intends to derive `finalPrice` from `price` and `discountPercent` on save; when importing directly, calculate it yourself (`price * (1 - discountPercent / 100)`).

```json
{
  "name": "Terracotta Pot",
  "description": "A breathable clay pot for herbs.",
  "category": { "$oid": "650000000000000000000010" },
  "price": 200,
  "costPrice": 120,
  "discountPercent": 10,
  "finalPrice": 180,
  "stock": 25,
  "images": ["uploads/terracotta-pot.jpg"],
  "relatedProducts": [],
  "isActive": true
}
```

### Blog (`blogs`)

Required: `title`, `content`, `author` (User ID), `category` (a string, not a Category ID). Optional: `image`, `tags` (string array), `isPublished` (defaults false), `slug`. The save hook generates a slug when title changes, but raw imports bypass that hook; supply a unique lowercase slug yourself.

```json
{
  "title": "How to care for basil",
  "slug": "how-to-care-for-basil",
  "content": "Place basil in bright light and keep its soil evenly moist.",
  "image": "uploads/basil-guide.jpg",
  "author": { "$oid": "650000000000000000000020" },
  "tags": ["basil", "herbs", "care"],
  "category": "Plant Care",
  "isPublished": true
}
```

### Post (`posts`)

Required: `title`, `content`. `author` is a User ID; `comments` is an array of Comment IDs. `status` is `pending`, `approved`, or `rejected` (defaults to `pending`). The API create handler always starts posts as pending; public listing includes approved posts and legacy posts without a status.

```json
{
  "title": "My basil is growing well",
  "content": "I moved it to a sunnier window and new leaves appeared.",
  "author": { "$oid": "650000000000000000000020" },
  "comments": [],
  "status": "approved"
}
```

### Comment (`comments`)

`text`, `author` (User ID), and `post` (Post ID) are not marked required in the schema, but the create handler expects a valid post ID and adds the new comment ID to that post's `comments` array. A raw import does not update the post, so also add its comment IDs to the corresponding post document.

```json
{
  "text": "Thanks, this helped!",
  "author": { "$oid": "650000000000000000000020" },
  "post": { "$oid": "650000000000000000000030" }
}
```

### UserPlant (`userplants`)

Required: `user` (User ID), `plant` (Plant ID). Dates are ISO dates/Extended JSON dates. `addedAt` and `lastWateredDate` default to now; `wateringSchedule` is an array of dates; `calculatedGrowthPlan` contains `stageName`, `startDate`, `endDate`, and optional `isCompleted` (defaults false). The dashboard endpoint calculates these values from the plant's `waterNeeds.frequency` and `growthStages`. Prefer that endpoint for adding a user's plant instead of raw import.

```json
{
  "user": { "$oid": "650000000000000000000020" },
  "plant": { "$oid": "650000000000000000000001" },
  "addedAt": { "$date": "2026-10-13T00:00:00.000Z" },
  "lastWateredDate": { "$date": "2026-10-13T00:00:00.000Z" },
  "nextWateringDate": { "$date": "2026-10-16T00:00:00.000Z" },
  "wateringSchedule": [
    { "$date": "2026-10-16T00:00:00.000Z" },
    { "$date": "2026-10-19T00:00:00.000Z" }
  ],
  "calculatedGrowthPlan": [
    {
      "stageName": "Seedling",
      "startDate": { "$date": "2026-10-13T00:00:00.000Z" },
      "endDate": { "$date": "2026-10-27T00:00:00.000Z" },
      "isCompleted": false
    }
  ]
}
```

## Using the API instead of a database import

Admin create endpoints require authentication and an admin role for categories, plants, fertilizers, diseases, products, and blogs. Posts require authentication; comments are currently public in the route configuration. Their routes are mounted in `backend/index.js`:

| Data | Create route | Notes |
| --- | --- | --- |
| Category | `POST /api/category/` | JSON body |
| Plant | `POST /api/plants/` | Multipart; up to 5 `images`; nested arrays/objects can be JSON strings, parsed by middleware |
| Fertilizer | `POST /api/fertilizers/` | Multipart; `image`; nested JSON values parsed |
| Disease | `POST /api/diseases/` | Multipart; `image`; nested JSON values parsed |
| Product | `POST /api/product/add` | Multipart; up to 5 `images` |
| Blog | `POST /api/blogs` | Multipart; `image`; controller takes `tags` as comma-separated text and author from authenticated user |
| Post | `POST /api/posts/` | JSON; controller takes `author` from request body and assigns pending status |
| Comment | `POST /api/comments/` | JSON; requires `post`, `text`, and `author` in body; updates the post reference array |
| UserPlant | `POST /api/dashboard/add-plant` | Authenticated JSON `{ "plantId": "<plant ObjectId>" }`; user is taken from token and dates/plans are calculated |

When sending nested values as `multipart/form-data`, send fields such as `temperatureRange`, `growthStages`, `composition`, or `symptoms` as JSON text (for example `[{"name":"Seedling","durationInDays":14}]`). `parseJsonFields` runs on plant, fertilizer, and disease routes. Product multipart requests do not use it, so use the API with care for array-valued fields; database import is often simpler for bulk seed data.

## Import checklist

1. Confirm the target database in `MONGO_URI` and make a backup before replacing existing collection data.
2. Create or identify all referenced Users, Categories, Plants, and related records first; copy their actual ObjectIds into dependent documents.
3. For API-created records, upload images as files. For imports, use paths/URLs in string fields; importing a filename does not upload the image.
4. Check unique fields (`Category.name`, `Category.slug`, `Blog.slug`) before importing to avoid duplicate-key errors in the API or duplicates in raw MongoDB imports.
5. Keep numeric values numeric, booleans boolean, lists as arrays, and references as ObjectIds rather than names.

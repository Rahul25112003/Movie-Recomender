
🎬 Marquee — Intelligent Movie Recommendation System

Discover Movies. Explore Stories. Find Your Next Favourite.

<p align="center">
  <a href="https://movie-recomender-kuu7.onrender.com/">
    <strong>🚀 Live Application</strong>
  </a>
  &nbsp; | &nbsp;
  <a href="https://github.com/Rahul25112003/Movie-Recomender">
    <strong>💻 GitHub Repository</strong>
  </a>
</p>---

📌 1. Project Overview

Marquee is a web-based movie discovery and recommendation platform developed to make movie exploration easier, smarter, and more personalised.

The application combines Machine Learning-based content similarity with real-time movie information from The Movie Database (TMDB) API.

Instead of simply displaying a static collection of movies, the system allows users to search for films, explore trending and popular releases, discover similar movies, view detailed movie information, and maintain a personal watchlist.

The recommendation engine uses TF-IDF (Term Frequency–Inverse Document Frequency) and Cosine Similarity to identify movies that share similar content characteristics.

The application also uses TMDB's movie discovery and genre endpoints to provide additional recommendations based on movie categories and popularity.

Project Information

Attribute| Description
Project Name| Marquee – Movie Recommendation System
Project Category| Machine Learning / Full-Stack Application
Recommendation Approach| Content-Based Filtering
NLP Technique| TF-IDF
Similarity Algorithm| Cosine Similarity
Backend Framework| FastAPI
Frontend| HTML, CSS, JavaScript
Movie Data API| TMDB API
Data Processing| Pandas, NumPy
ML Library| Scikit-learn
Deployment| Render

---

🎯 2. Problem Statement

The availability of thousands of movies across different platforms has made movie selection increasingly difficult.

Users frequently face the following problems:

1. Information Overload

There are thousands of movies available, and manually exploring them takes considerable time.

2. Generic Recommendations

Popular movie lists do not necessarily represent a user's interests. A user who enjoys science-fiction movies may not find a general popularity-based list useful.

3. Lack of Content Similarity

Users often want to discover movies similar to a particular movie they already enjoyed, rather than simply receiving random popular suggestions.

4. Fragmented Movie Information

Movie posters, descriptions, genres, ratings, release dates, and trailers are often spread across different sources.

5. Poor Movie Discovery Experience

Traditional movie lists do not always provide an intuitive way to search, explore, save, and discover related movies in one place.

Our Objective

To develop an integrated movie discovery platform that:

- Identifies movies with similar content.
- Provides intelligent recommendations using text-based similarity.
- Retrieves current movie information through an external API.
- Organises movies into discovery categories.
- Provides detailed movie information in one interface.
- Allows users to maintain their personal watchlist.

---

💡 3. Proposed Solution

To address these challenges, we developed Marquee using a combination of Machine Learning, external API integration, backend development, and frontend technologies.

The solution consists of two major recommendation approaches.

A. Content-Based Movie Recommendation

The first approach uses TF-IDF and Cosine Similarity.

The system compares the numerical text representations of movies and identifies those that have similar content characteristics.

For example:

If a user selects a science-fiction movie, the system can identify other movies whose processed textual representations are mathematically similar.

The recommendation process follows these steps:

1. Load the preprocessed movie dataset.
2. Load the trained TF-IDF vectorizer and TF-IDF matrix.
3. Identify the selected movie in the dataset.
4. Retrieve its corresponding TF-IDF vector.
5. Calculate similarity scores against other movie vectors.
6. Sort the movies according to their similarity scores.
7. Return the highest-ranked recommendations.

B. Genre-Based Movie Discovery

The second approach uses the TMDB API.

When a user selects a movie, the backend retrieves its details from TMDB, identifies its primary genre, and requests other movies belonging to that genre.

The results are ordered using popularity information supplied by TMDB.

This approach provides an additional discovery mechanism alongside the local TF-IDF recommendation engine.

Why use both approaches?

TF-IDF identifies similarity based on the processed movie text representation, whereas genre-based discovery provides category-related recommendations using external movie metadata.

Combining these approaches creates a more flexible movie discovery experience.

---

🧠 4. Machine Learning Methodology

4.1 Understanding Content-Based Filtering

Content-Based Filtering is a recommendation technique that identifies items with characteristics similar to those of an item selected by a user.

Unlike collaborative filtering, which depends on user behaviour and ratings from multiple users, content-based filtering can work using item-level information.

In this project, the recommendation engine compares movie representations rather than relying on a user-rating matrix.

4.2 TF-IDF: Term Frequency–Inverse Document Frequency

TF-IDF is a statistical technique used in Natural Language Processing to convert text into numerical representations.

It measures the importance of a word within a document relative to a collection of documents.

It consists of two main components.

Term Frequency (TF)

Measures how frequently a particular word appears in a document.

[
TF(t,d)=\frac{\text{Frequency of }t\text{ in }d}{\text{Total terms in }d}
]

Inverse Document Frequency (IDF)

Measures how informative a word is across the entire collection of documents.

[
IDF(t)=\log\left(\frac{N}{DF(t)}\right)
]

Where:

- N = Total number of documents.
- DF(t) = Number of documents containing term t.

The combined formula is:

[
TFIDF(t,d)=TF(t,d)\times IDF(t)
]

Why TF-IDF?

TF-IDF helps transform textual information into a mathematical format that can be compared.

It gives relatively greater importance to words that are informative within a document and less importance to words that occur frequently throughout the collection.

4.3 Cosine Similarity

After converting movie text into numerical vectors, the system calculates similarity using Cosine Similarity.

It measures the cosine of the angle between two vectors.

[
Similarity(A,B)=
\frac{A\cdot B}{|A||B|}
]

Interpretation:

Similarity Score| General Interpretation
Close to 1| Highly similar vectors
Around 0| Little directional similarity
Close to -1| Opposite vector directions

For conventional non-negative TF-IDF vectors, similarity generally ranges from 0 to 1.

Example

Suppose the selected movie has the following similarity scores:

Movie| Similarity
Movie A| 0.92
Movie B| 0.84
Movie C| 0.73
Movie D| 0.41

The recommendation system ranks Movie A first because it has the highest similarity score.

These are illustrative scores, not measured results from the deployed application.

4.4 Recommendation Ranking

The backend retrieves the vector corresponding to the selected movie and calculates its similarity with all movie vectors.

Conceptually:

query_vector = tfidf_matrix[movie_index]

similarity_scores = (
    tfidf_matrix @ query_vector.T
).toarray().ravel()

ranked_indices = np.argsort(-similarity_scores)

The selected movie itself is excluded from the recommendation list.

The backend then retrieves the titles of the highest-ranked movies.

---

🔄 5. Complete Project Workflow

The system can be understood through five major stages.

Stage 1: Data Preparation

- Collect movie metadata.
- Organise movie records into a structured dataset.
- Prepare movie titles and corresponding indexing information.
- Generate numerical TF-IDF representations.
- Save the processed resources as pickle files.

Stage 2: Model Resource Loading

When FastAPI starts, the application loads the preprocessed dataset, title-index mapping, TF-IDF matrix, and TF-IDF vectorizer.

This prevents the application from having to reconstruct all recommendation resources for every incoming request.

Stage 3: User Interaction

The user interacts with the frontend through movie search, discovery tabs, movie cards, and movie detail views.

JavaScript handles these interactions and sends HTTP requests to the backend.

Stage 4: Backend Processing

FastAPI receives requests and determines which operation is required.

Depending on the request, it can:

- Retrieve trending and popular movies.
- Search TMDB for a movie.
- Retrieve movie details.
- Generate TF-IDF-based recommendations.
- Generate genre-based recommendations.
- Combine movie details and recommendation results.

Stage 5: Response and Display

The backend returns structured JSON responses.

JavaScript processes the responses and updates the interface with movie posters, titles, ratings, descriptions, and recommendation sections.

---

🏗️ 6. System Architecture

The application follows a frontend–backend architecture with an integrated recommendation engine and an external movie data provider.

flowchart TD
    A["User"] --> B["Frontend Interface"]
    B --> C["HTML / CSS / JavaScript"]
    C --> D["FastAPI Backend"]

    D --> E["Movie Recommendation Engine"]
    D --> F["TMDB API"]

    E --> G["Processed Movie Dataset"]
    E --> H["TF-IDF Vectorizer"]
    E --> I["TF-IDF Matrix"]
    E --> J["Movie Index Mapping"]

    F --> K["Movie Metadata"]
    K --> L["Posters / Ratings / Details"]

    E --> M["Similarity Recommendations"]
    F --> N["Genre / Trending / Popular Results"]

    M --> O["JSON Response"]
    N --> O
    O --> P["Frontend Rendering"]
    P --> Q["Movie Discovery Interface"]

How the Components Communicate

Frontend → Backend

JavaScript sends HTTP GET requests to FastAPI endpoints.

Backend → ML Engine

The backend passes a selected movie title to the recommendation function.

ML Engine → Backend

The recommendation function returns movie titles and their similarity scores.

Backend → TMDB

The backend uses TMDB API requests to retrieve movie information, posters, genres, and other metadata.

Backend → Frontend

The backend returns JSON data, which JavaScript converts into interactive movie cards and detail sections.

---

📁 7. Repository Structure and File Responsibilities

The following explains the role of every important file in the repository.

Movie-Recomender/
│
├── main.py
│
├── index.html
├── style.css
├── app.js
│
├── movies_metadata.csv
│
├── df.pkl
├── indices.pkl
├── tfidf.pkl
├── tfidf_matrix.pkl
│
├── rebuild_pickles.py
│
├── requirements.txt
├── .python-version
│
└── .gitignore

7.1 main.py — Backend Application

Responsibility: Main application logic and API integration.

This is the central Python backend file.

It uses FastAPI to create endpoints, process requests, load recommendation resources, communicate with TMDB, and return structured responses.

Major responsibilities:

- Initialise the FastAPI application.
- Load environment variables.
- Configure the TMDB API connection.
- Load the pickle-based recommendation resources.
- Implement TF-IDF similarity calculations.
- Retrieve movie details and metadata.
- Generate movie recommendations.
- Serve frontend files.
- Handle API errors and response validation.

Some important endpoints include:

Endpoint| Purpose
"/"| Serves the main website
"/health"| Checks backend availability
"/home"| Retrieves movie discovery categories
"/tmdb/search"| Searches movies through TMDB
"/recommend/genre"| Generates genre-based recommendations
"/recommend/tfidf"| Returns TF-IDF similarity results
"/recommend/similar"| Finds similar movies
"/movie/search"| Combines movie details and recommendation results

The "/movie/search" endpoint provides a bundled response containing movie details, TF-IDF recommendations, and genre recommendations.

7.2 index.html — Frontend Structure

Responsibility: Defines the website's layout and structural elements.

This file provides the HTML foundation of the application.

Important elements include:

- Website header and branding.
- Movie search input.
- Navigation tabs.
- Movie discovery grid.
- Movie details container.
- Trailer lightbox.
- Notification or toast container.

It also connects the CSS and JavaScript files:

<link rel="stylesheet" href="style.css">

<script src="app.js"></script>

The HTML file provides the structure, while JavaScript dynamically updates the content.

7.3 style.css — User Interface and Styling

Responsibility: Controls the visual appearance of the website.

This file contains the styling rules for the Marquee interface.

Its responsibilities include:

- Layout and responsive design.
- Typography and colour combinations.
- Movie poster presentation.
- Movie cards and navigation tabs.
- Search bar styling.
- Movie details presentation.
- Modal and trailer layouts.
- Hover effects and animations.
- Loading placeholders and notifications.

The main purpose of this file is to provide a consistent and visually organised user experience.

7.4 app.js — Frontend Logic and API Communication

Responsibility: Connects user interactions with the backend.

This is the main JavaScript application controller.

It manages:

- Movie search interactions.
- Discovery category selection.
- API requests using Fetch.
- JSON response processing.
- Movie card generation.
- Movie detail rendering.
- Similar movie sections.
- Watchlist operations.
- Trailer interactions.
- Loading and error states.

For example, the application uses a reusable API function:

async function api(path, signal) {
    const response = await fetch(API + path, {
        signal
    });

    if (!response.ok) {
        throw new Error("Server error");
    }

    return response.json();
}

This function makes it possible for the frontend to communicate with FastAPI endpoints.

Important: The JavaScript file does not independently perform the TF-IDF calculations. It requests recommendation results from the Python backend.

7.5 movies_metadata.csv — Original Movie Dataset

Responsibility: Stores the movie metadata used as a data source for the recommendation pipeline.

CSV files provide structured tabular data that can be loaded and processed using Pandas.

Typical movie dataset fields may include:

- Movie title.
- Release information.
- Genres.
- Movie descriptions.
- Other available metadata.

The CSV represents the dataset file in the repository. The deployed recommendation engine uses its processed pickle resources during runtime.

7.6 df.pkl — Processed Movie DataFrame

Responsibility: Stores the processed movie dataset.

The backend loads this file into a Pandas DataFrame.

It is particularly important because the recommendation function uses the DataFrame to retrieve movie titles using the ranked row positions.

For example:

movie_title = df.iloc[movie_index]["title"]

Without the corresponding processed DataFrame, the system would not be able to reliably map the calculated similarity results back to movie titles.

7.7 indices.pkl — Movie Index Mapping

Responsibility: Connects movie titles with their corresponding numerical row positions.

The backend converts the stored mapping into a normalised title-to-index dictionary.

For example:

Movie A → 0
Movie B → 1
Movie C → 2
Movie D → 3

When a user selects a movie, this mapping helps the backend identify its position in the TF-IDF matrix.

7.8 tfidf.pkl — TF-IDF Vectorizer

Responsibility: Stores the fitted TF-IDF vectorizer object.

A fitted vectorizer contains the learned vocabulary and related configuration needed to transform text consistently using the original feature space.

It is loaded by the backend along with the other model resources.

It is also useful for maintaining or extending the text-processing pipeline.

7.9 tfidf_matrix.pkl — TF-IDF Feature Matrix

Responsibility: Stores the numerical representation of the processed movies.

Each row corresponds to a movie, while columns represent the TF-IDF features.

The matrix is used directly by the similarity calculation.

Conceptually:

Movie| Feature 1| Feature 2| Feature 3
Movie A| 0.80| 0.20| 0.10
Movie B| 0.75| 0.25| 0.05
Movie C| 0.10| 0.70| 0.80

These numbers are illustrative only.

7.10 rebuild_pickles.py — Pickle Maintenance Utility

Responsibility: Creates backups and re-serializes the existing pickle resources.

The current implementation:

1. Imports the pickle file paths from "main.py".
2. Creates ".bak" backup copies.
3. Loads the existing pickle objects.
4. Saves the objects again.

It is a maintenance utility, not a full model-training script.

7.11 requirements.txt — Python Dependencies

Responsibility: Lists the Python packages required by the backend.

The repository currently includes:

Package| Purpose
FastAPI| Backend API framework
Uvicorn| ASGI server
python-dotenv| Environment configuration
httpx| Asynchronous HTTP requests
NumPy| Numerical calculations
SciPy| Sparse matrix operations
Pandas| Dataset processing
Scikit-learn| Machine Learning utilities

7.12 .python-version — Python Runtime Configuration

Responsibility: Specifies the intended Python version.

The repository specifies:

3.12.8

This helps maintain a consistent Python runtime during development and deployment.

7.13 .gitignore — Git Exclusion Rules

Responsibility: Specifies files and directories that Git should ignore.

This helps prevent unnecessary files, local development artefacts, and sensitive configuration files from being committed.

---

🔗 8. How All Files Are Connected

Understanding individual files is important, but understanding their relationships is even more important.

The following describes the actual application flow.

A. Dataset to Machine Learning

movies_metadata.csv
        |
        v
Data Preparation
        |
        v
Processed DataFrame
        |
        v
df.pkl
        |
        +-----------------------+
        |                       |
        v                       v
indices.pkl              TF-IDF Processing
                                |
                       +--------+--------+
                       |                 |
                       v                 v
                  tfidf.pkl       tfidf_matrix.pkl

The dataset and the preprocessed resources form the foundation of the recommendation engine.

The pickle files are loaded by the backend at application startup.

B. Frontend to Backend

index.html
     |
     +------ style.css
     |
     +------ app.js
                 |
                 v
             Fetch API
                 |
                 v
              main.py
                 |
                 v
            FastAPI Routes

The HTML creates the interface, CSS styles it, and JavaScript handles user interaction and API communication.

C. Recommendation Processing

User selects a movie
        |
        v
Frontend sends request
        |
        v
FastAPI receives request
        |
        v
TMDB retrieves movie details
        |
        v
Movie title is identified
        |
        v
indices.pkl finds row position
        |
        v
tfidf_matrix.pkl retrieves vector
        |
        v
Cosine Similarity calculation
        |
        v
Recommendations are ranked
        |
        v
TMDB enriches movie cards
        |
        v
JSON response
        |
        v
JavaScript displays recommendations

D. TMDB Integration

TMDB provides additional movie information that complements the local recommendation engine.

The backend uses the API to retrieve:

- Movie search results.
- Trending movies.
- Popular movies.
- Top-rated movies.
- Upcoming movies.
- Movie details.
- Genres.
- Posters and backdrops.
- Cast and crew information.
- Trailer information.

The backend then formats the information into structured responses that the frontend can display.

---

🖥️ 9. Application Features

Movie Discovery

- Trending movies.
- Popular movies.
- Top-rated movies.
- Upcoming movies.
- Movies currently playing in theatres.

Movie Search

Users can search for movies using their titles and explore matching results.

Similar Movie Recommendations

The application identifies movies similar to a selected movie through TF-IDF and Cosine Similarity.

Genre-Based Recommendations

The application also discovers movies using the selected movie's primary genre and TMDB popularity sorting.

Movie Details

Users can explore:

- Movie overview.
- Release date.
- Runtime.
- Genre.
- Rating.
- Movie posters.
- Backdrops.
- Cast and crew.
- Production details.
- Available trailers.

Personal Watchlist

Users can add and remove movies from their watchlist.

The watchlist is stored in browser localStorage, allowing it to persist across page reloads in the same browser.

---

🛠️ 10. Technology Stack

Technology| Implementation
Python| Backend development
FastAPI| REST API development
HTML5| Frontend structure
CSS3| Interface styling
JavaScript| Dynamic interactions
Pandas| Dataset management
NumPy| Numerical operations
Scikit-learn| TF-IDF model resources
SciPy| Sparse matrix calculations
Cosine Similarity| Movie similarity measurement
TMDB API| Movie information retrieval
Pickle| Model and data serialisation
Render| Application deployment
Git & GitHub| Version control

---

⚙️ 11. Local Installation and Execution

Follow these steps to run the project locally.

Step 1: Clone the Repository

git clone https://github.com/Rahul25112003/Movie-Recomender.git

Step 2: Navigate to the Project

cd Movie-Recomender

Step 3: Create a Virtual Environment

python -m venv venv

Activate it:

Windows:

venv\Scripts\activate

Linux / macOS:

source venv/bin/activate

Step 4: Install Dependencies

pip install -r requirements.txt

Step 5: Configure the TMDB API Key

Create a ".env" file in the project directory.

TMDB_API_KEY=your_tmdb_api_key

You can obtain an API key from the official TMDB developer platform.

Step 6: Start the Application

uvicorn main:app --host 0.0.0.0 --port 8000

Step 7: Open the Website

http://localhost:8000

Step 8: Explore API Documentation

FastAPI automatically provides interactive API documentation.

http://localhost:8000/docs

Important: Keep all four pickle files in the project directory alongside "main.py". The application loads them during startup.

---

🚀 12. Deployment Architecture

The application is deployed using Render.

The backend serves the frontend files directly through FastAPI.

This means the HTML, CSS, JavaScript, and Python backend are served by the same application rather than requiring a separately hosted frontend.

Deployment process:

1. Push the project files to GitHub.
2. Connect the GitHub repository to Render.
3. Configure the Python environment.
4. Install dependencies from "requirements.txt".
5. Configure the "TMDB_API_KEY" environment variable.
6. Configure the Uvicorn start command.
7. Deploy the application.
8. Test the frontend and API endpoints.

Live application: https://movie-recomender-kuu7.onrender.com/

---

⚠️ 13. Challenges and Technical Considerations

During the development of this project, several engineering challenges needed to be considered.

Challenge 1: Mapping Movie Titles to Numerical Vectors

The recommendation engine operates on numerical vectors, but users interact with movie titles.

Solution: The title-index mapping connects movie titles with their corresponding positions in the TF-IDF matrix.

Challenge 2: Efficient Recommendation Retrieval

Reconstructing the recommendation model for every request would introduce unnecessary processing overhead.

Solution: Precomputed TF-IDF resources are stored in pickle files and loaded when the backend starts.

Challenge 3: Combining Machine Learning with External Data

The local dataset and TMDB may contain different movie records or naming variations.

Solution: The backend searches TMDB using recommended movie titles and attaches available movie cards and metadata to the recommendation results.

Challenge 4: Frontend and Backend Communication

The interface needs to retrieve data from multiple endpoints without reloading the complete page.

Solution: JavaScript Fetch API handles asynchronous communication with FastAPI.

Challenge 5: External API Reliability

External API requests may fail because of network problems, invalid API keys, or unavailable data.

Solution: The backend uses HTTP error handling and returns meaningful errors for different failure conditions.

Challenge 6: Persistent User Watchlist

Users expect saved movies to remain available after refreshing the website.

Solution: Browser localStorage stores the watchlist locally.

---

📈 14. Limitations and Future Improvements

Although the current application provides movie similarity and discovery functionality, there are several opportunities for improvement.

Current Limitations

- The TF-IDF recommendation engine depends on the coverage of its local processed dataset.
- A movie absent from the local dataset may not receive TF-IDF recommendations.
- The similarity score measures textual vector similarity, not actual user preference.
- Genre recommendations use the primary genre and TMDB popularity sorting rather than personalised ranking.
- The current watchlist is browser-specific and is not synchronised across different devices.
- Recommendations do not currently learn from an individual's viewing history or explicit feedback.

Future Development Roadmap

1. Advanced Recommendation Algorithms

Explore alternative approaches such as:

- CountVectorizer.
- Word2Vec.
- Sentence Transformers.
- Semantic similarity.
- Hybrid recommendation systems.

2. Personalised Recommendations

Introduce user preferences, watch history, ratings, and feedback.

3. Collaborative Filtering

Explore user-item interaction matrices and collaborative filtering to identify patterns across multiple users.

4. Hybrid Recommendation Engine

Combine content similarity, genre similarity, user preferences, and collaborative filtering.

5. Improved Search

Introduce fuzzy matching and better handling of alternative titles.

6. Recommendation Evaluation

Evaluate the model using suitable ranking metrics, such as:

- Precision@K.
- Recall@K.
- MAP@K.
- NDCG@K.

7. Scalable Architecture

Introduce caching, database-backed watchlists, improved API monitoring, and more efficient retrieval for larger movie collections.

---

📊 15. Project Learning Outcomes

This project demonstrates practical implementation of several important concepts.

Machine Learning and Data Science

- Content-Based Recommendation Systems.
- Natural Language Processing fundamentals.
- TF-IDF feature extraction.
- Cosine Similarity.
- Numerical vector operations.
- Data preprocessing.
- Model serialisation and loading.

Backend Engineering

- FastAPI application development.
- REST API implementation.
- External API integration.
- Asynchronous HTTP requests.
- Request validation using Pydantic.
- Backend error handling.

Frontend Development

- HTML structure.
- Responsive CSS design.
- JavaScript DOM manipulation.
- Fetch API integration.
- Dynamic rendering.
- Browser localStorage.

Deployment and Development

- Git and GitHub.
- Python dependency management.
- Environment variable configuration.
- Render deployment.
- Full-stack application integration.

---

👨‍💻 16. Author

Rahul Maji

Electronics & Communication Engineering | Machine Learning | Data Analytics | Python

Interested in developing practical applications using Machine Learning, Data Science, and software engineering.

- GitHub: https://github.com/Rahul25112003
- Project Repository: https://github.com/Rahul25112003/Movie-Recomender
- Live Project: https://movie-recomender-kuu7.onrender.com/

---

📄 17. Data and API Attribution

Movie information, posters, and associated media are retrieved using the TMDB API.

This product uses the TMDB API but is not endorsed or certified by TMDB.

TMDB website: https://www.themoviedb.org/

---

⭐ Support

If you find this project interesting or useful, consider giving the repository a star on GitHub.

Your feedback and suggestions for improving the recommendation system are welcome.

Discover. Explore. Recommend. — Marquee.
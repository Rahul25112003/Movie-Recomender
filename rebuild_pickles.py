import pickle
import shutil
import warnings

warnings.filterwarnings("ignore")

from main import DF_PATH, INDICES_PATH, TFIDF_MATRIX_PATH, TFIDF_PATH

for path in [DF_PATH, INDICES_PATH, TFIDF_MATRIX_PATH, TFIDF_PATH]:
    shutil.copy(path, str(path) + ".bak")      # backup of the old file
    with open(path, "rb") as f:
        obj = pickle.load(f)
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print("re-saved:", path)
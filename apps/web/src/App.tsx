import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { ArticlePage } from "./pages/ArticlePage";
import { AdminArticlesPage } from "./pages/admin/AdminArticlesPage"; 
import { AdminArticleEditorPage } from "./pages/admin/AdminArticleEditorPage";
import { AdminContentPage } from "./pages/admin/AdminContentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/articles/:slug"
          element={<ArticlePage />}
        />

        <Route
          path="/admin/articles"
          element={<AdminArticlesPage />}
        />
        <Route
          path="/admin/articles/new"
          element={<AdminArticleEditorPage />}
        />

        <Route
          path="/admin/articles/:id"
          element={<AdminArticleEditorPage />}
        />

        <Route
          path="/admin/content"
          element={<AdminContentPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

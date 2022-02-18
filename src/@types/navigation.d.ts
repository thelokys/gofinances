import { AppRoutesListProps } from "../routes/app.routes";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRoutesListProps {}
  }
}
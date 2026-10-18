import { AppHeaderUI } from '@ui';
import { useMatch } from 'react-router-dom';

import { selectUser } from '@services/slices/user';
import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  /* Детали ингредиента открываются из конструктора, поэтому на этом
     маршруте ссылка «Конструктор» тоже остаётся активной. */
  const ingredientMatch = useMatch('/ingredients/:id');

  return <AppHeaderUI userName={user?.name} isConstructorActive={!!ingredientMatch} />;
};

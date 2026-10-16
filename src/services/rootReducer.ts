import { combineSlices } from '@reduxjs/toolkit';

import { burgerConstructorSlice } from './slices/burger-constructor';
import { feedSlice } from './slices/feed';
import { ingredientsSlice } from './slices/ingredients';
import { orderSlice } from './slices/order';
import { profileOrdersSlice } from './slices/profile-orders';
import { userSlice } from './slices/user';

export const rootReducer = combineSlices(
  ingredientsSlice,
  burgerConstructorSlice,
  orderSlice,
  feedSlice,
  profileOrdersSlice,
  userSlice
);

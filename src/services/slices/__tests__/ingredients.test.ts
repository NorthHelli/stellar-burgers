import { fetchIngredients, ingredientsSlice } from '../ingredients';
import { ingredients } from './fixtures';

const reducer = ingredientsSlice.reducer;
const initialState = reducer(undefined, { type: 'UNKNOWN' });

describe('редьюсер ingredients', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    expect(initialState).toEqual({
      items: [],
      isLoading: true,
      error: null,
    });
  });

  it('при fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const state = reducer(
      { ...initialState, isLoading: false, error: { message: 'Ошибка' } },
      { type: fetchIngredients.pending.type }
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('при fetchIngredients.fulfilled сохраняет ингредиенты и выключает загрузку', () => {
    const state = reducer(initialState, {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients,
    });

    expect(state.items).toEqual(ingredients);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('при fetchIngredients.rejected сохраняет ошибку и выключает загрузку', () => {
    const error = { message: 'Не удалось загрузить ингредиенты' };

    const state = reducer(initialState, {
      type: fetchIngredients.rejected.type,
      error,
    });

    expect(state.isLoading).toBe(false);
    expect(state.error).toEqual(error);
    expect(state.items).toEqual([]);
  });
});

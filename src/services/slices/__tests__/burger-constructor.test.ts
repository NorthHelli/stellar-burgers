import {
  addIngredient,
  burgerConstructorSlice,
  clearConstructor,
  moveIngredient,
  removeIngredient,
} from '../burger-constructor';
import { createOrder } from '../order';
import { bun, main, otherBun, sauce } from './fixtures';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const reducer = burgerConstructorSlice.reducer;

const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

/* id генерируется через nanoid, поэтому сравниваем ингредиент без него */
const withoutId = ({
  id: _constructorId,
  ...ingredient
}: TConstructorIngredient): TIngredient => ingredient;

const filledState: TConstructorState = {
  bun: withId(bun, 'bun-1'),
  ingredients: [
    withId(main, 'main-1'),
    withId(sauce, 'sauce-1'),
    withId(main, 'main-2'),
  ],
};

describe('редьюсер burgerConstructor', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  describe('addIngredient', () => {
    it('устанавливает булку и добавляет ей уникальный id', () => {
      const state = reducer(undefined, addIngredient(bun));

      expect(state.bun && withoutId(state.bun)).toEqual(bun);
      expect(state.bun?.id).toEqual(expect.stringMatching(/.+/));
      expect(state.ingredients).toEqual([]);
    });

    it('заменяет ранее выбранную булку новой', () => {
      const state = reducer(filledState, addIngredient(otherBun));

      expect(state.bun?._id).toBe(otherBun._id);
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    it('добавляет начинку в конец списка с уникальным id', () => {
      const state = reducer(filledState, addIngredient(sauce));
      const addedIngredient = state.ingredients[state.ingredients.length - 1];

      expect(state.ingredients).toHaveLength(filledState.ingredients.length + 1);
      expect(withoutId(addedIngredient)).toEqual(sauce);
      expect(addedIngredient.id).toEqual(expect.stringMatching(/.+/));
      expect(state.bun).toEqual(filledState.bun);
    });

    it('присваивает одинаковым ингредиентам разные id', () => {
      const firstState = reducer(undefined, addIngredient(main));
      const secondState = reducer(firstState, addIngredient(main));
      const [first, second] = secondState.ingredients;

      expect(first.id).not.toBe(second.id);
    });
  });

  it('removeIngredient удаляет ингредиент по id', () => {
    const state = reducer(filledState, removeIngredient('sauce-1'));

    expect(state.ingredients.map(({ id }) => id)).toEqual(['main-1', 'main-2']);
    expect(state.bun).toEqual(filledState.bun);
  });

  describe('moveIngredient', () => {
    it('перемещает ингредиент вниз', () => {
      const state = reducer(filledState, moveIngredient({ from: 0, to: 1 }));

      expect(state.ingredients.map(({ id }) => id)).toEqual([
        'sauce-1',
        'main-1',
        'main-2',
      ]);
    });

    it('перемещает ингредиент вверх', () => {
      const state = reducer(filledState, moveIngredient({ from: 2, to: 1 }));

      expect(state.ingredients.map(({ id }) => id)).toEqual([
        'main-1',
        'main-2',
        'sauce-1',
      ]);
    });
  });

  it('clearConstructor очищает конструктор', () => {
    expect(reducer(filledState, clearConstructor())).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  it('очищает конструктор после успешного оформления заказа', () => {
    const state = reducer(filledState, { type: createOrder.fulfilled.type });

    expect(state).toEqual({ bun: null, ingredients: [] });
  });

  it('не очищает конструктор, пока заказ оформляется или если он не оформился', () => {
    expect(reducer(filledState, { type: createOrder.pending.type })).toEqual(
      filledState
    );
    expect(reducer(filledState, { type: createOrder.rejected.type })).toEqual(
      filledState
    );
  });
});

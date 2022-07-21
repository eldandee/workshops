/**
 * 🧑‍💻 Here, we've got some code that represents which types of roles
 * can access different actions on users in our database.
 *
 * It's a relatively simple role-based access system.
 */

const userAccessModel = {
  //  ^ 🚁
  user: ["update-self", "view"],
  admin: ["create", "update-self", "update-any", "delete", "view"],
  anonymous: ["view"],
} as const;

/**
 * 🚁 Hover userAccessModel. We know what as const does - it freezes
 * an object and makes it readonly. We can see from this inference
 * that it ALSO does the same to arrays. We're getting inference on
 * all of the members of each array.
 *
 * 🕵️‍♂️ Try removing and re-adding as const, and see what happens
 * to the inference.
 */

export type Role = keyof typeof userAccessModel;
/**         ^ 🚁
 *
 * 🚁 Hover Role. We know about this, too. We're grabbing
 * the keys of userAccessModel by first turning it into
 * a type (with typeof), then grabbing the keys with keyof.
 */

// export type Action = typeof userAccessModel[Role][number];
/**         ^ 🚁
 *
 * 🚁 Hover Action. This is... interesting. What's [number]
 * doing there? We'll get to it later.
 */

export const canUserAccess = (role: Role, action: Action) => {
  const possibleActions = userAccessModel[role];
  return possibleActions.includes(action as any);
  /**
   * 🕵️‍♂️ Hmmm, the ReadonlyArray<Action> looks a bit scary. Try
   * removing it to see what happens.
   *
   * ⛔️ Oh dear.
   *
   * Argument of type '"update-self" | "view" | "create" |
   * "update-any" | "delete"' is not assignable to parameter
   * of type '"view"'.
   *
   * 🛠 Let's just... put that back in.
   *
   * return (userAccessModel[role] as ReadonlyArray<Action>).includes(action);
   */
};

/**
 * 💡 So, there's some stuff to figure out here. Let's figure out
 * the [number] syntax first.
 *
 * 🛠 Comment out the Action type declared above, and re-add it
 * as unknown:
 *
 * type Action = unknown;
 */

type UserAccessModelValues = typeof userAccessModel[Role];

type Action = UserAccessModelValues[number];

/**
 * 💡 We can figure out the first couple of pieces of
 * typeof userAccessModel[Role][number].
 *
 * 🛠 Create a type called UserAccessModelValues, which is assigned
 * to userAccessModel[Role]:
 *
 * type UserAccessModelValues = typeof userAccessModel[Role];
 *      ^ 🚁
 *
 * 🚁 UserAccessModelValues is a union type of all of the values
 * of our object. This is similar to the Obj[keyof Obj] setup
 * we saw in the apiMapping exercise.
 *
 * | readonly ["update-self", "view"]
 * | readonly ["create", "update-self", "update-any", "delete", "view"]
 * | readonly ["view"]
 */

/**
 * 💡 When we want to access a member of an array, we can treat
 * it in the same way we would an object. Let's try it.
 *
 * 🛠 Change Action so that it accesses the first member of
 * UserAccessModelValues.
 *
 * type Action = UserAccessModelValues[0];
 *      ^ 🚁
 *
 * 🚁 Hover Action. Now, we're getting the FIRST member of each
 * of the arrays in the object.
 */

/**
 * 💡 Now, we could do the same thing as we did in the apiMapping
 * exercise, by specifying all of the pieces we want from the arrays:
 *
 * type Action = UserAccessModelValues[0 | 1 | 2 | 3];
 *
 * But there's a more elegant solution for accessing _all_ the keys:
 *
 * 🛠 Change Action so that it uses number to access UserAccessModelValues:
 *
 * type Action = UserAccessModelValues[number];
 *      ^ 🚁
 *
 * 🚁 Hover Action. Now, we're getting ALL members of ALL of the arrays.
 * Fabulous.
 */

/**
 * 💡 Now, let's take a look at the scary error we were experiencing
 * when removing as ReadonlyArray<Action>.
 *
 * 🛠 Remove as ReadonlyArray<Action>:
 *
 * return userAccessModel[role].includes(action);
 *
 * ⛔️ Guess who's back:
 *
 * Argument of type '"update-self" | "view" | "create" | "update-any"
 * | "delete"' is not assignable to parameter of type '"view"'.
 *
 * To understand this error, we're going to have to pretty deep.
 *
 * 🚁 Let's look at our UserAccessModelValues type again.
 *
 * This type is a union of readonly arrays. Some of those arrays
 * contain values that aren't present in the others. For instance,
 * "anonymous" only contains "view", but "admin" has "delete".
 *
 * When we call .includes, we're calling it on userAccessModel[role] -
 * which is exactly the same type as UserAccessModelValues.
 *
 * 🕵️‍♂️ Refactor the function so that saves userAccessModel[role]
 * into its own variable before calling includes on it.
 *
 * const possibleActions = userAccessModel[role];
 *       ^ 🚁
 * return possibleActions.includes(action);
 *
 * 🚁 Hover over possibleActions. It should be the same type
 * as UserAccessModelValues.
 *
 * Now that we've confirmed this, we need to look at the type
 * definition for .includes to understand what might be happening
 * there.
 */

/**
 * 🔮 Do a find-in-definition on .includes(action)
 *
 * return possibleActions.includes(action);
 *                        ^ 🔮
 *
 * You'll be taken to lib.es2016.array.include.d.ts. This is one
 * of the files that TypeScript uses to type JavaScript itself!
 * We're deep in enemy territory here.
 *
 * The definition for includes has a searchElement: T. This
 * is where our failure appears to be happening.
 *
 * 🕵️‍♂️ As an investigation, try changing searchElement: T to
 * searchElement: any.
 *
 * includes(searchElement: any, fromIndex?: number): boolean;
 *
 * The error disappears! Interesting. Now change it back, before
 * anyone notices.
 *
 * 💡 OK, we've now learned that the error is something to do with
 * searchElement: T. At this point in your search, it's time to
 * make a decision. We know that possibleActions.includes(action)
 * is correct, because both are derived from the config object.
 *
 * 🕵️‍♂️ Try casting the action to any:
 *
 * possibleActions.includes(action as any)
 *
 * It works? Nice.
 */

/**
 * 💡 Often, when doing more advanced typings, you're going to find
 * that casting to any is the most productive solution in your arsenal.
 * Many libraries doing advanced TS work, like TRPC and Zod, use 'any'
 * liberally.
 *
 * Because TypeScript is fundamentally not a sound type system (because
 * JavaScript itself is unsound), you will occasionally need to use any's
 * in _some places_ in your apps. My opinion is that the best place for
 * them is hidden away in useful functions, like the one above. Any's for
 * the function creator, not the function consumer.
 *
 * For the curious - yes, I found a different solution -
 * ReadonlyArray<Action> - which I'll explain in the break.
 */

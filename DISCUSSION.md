# DX QoL issues 
* `package.json` not set to `module`
* `drizzle.config.ts` doesn't match [suggested drizzle setup](https://orm.drizzle.team/docs/get-started/postgresql-new#step-5---setup-drizzle-config-file)
* No format setup

# Code improvements
* TS Config paths could be replaced by node package.json [imports](https://nodejs.org/api/packages.html#subpath-imports)
  * Haven't configured or explored this with Next.
* `npm run migrate:up` doesn't work as is
  * `next` comes with `.env` out of the box, but we need something like `dotenv` for node versions under 20 or [built-in for 20+](https://nodejs.org/docs/
  latest-v22.x/api/cli.html#--env-fileconfig) 
  * Opted to use `drizzle-kit migrate`

# Query or Select?
`drizzle` supports both the query pattern and a closer to sql pattern. I prefer the query pattern when possible.
* Better typing support out of the box
* Less code for simple selects, such as omitting a column

# To Memoize or Not To Memoize
Memoization does improve rendering performance, but it does come at a cost.
* Longer development to optimize as it requires more code
* Memoization causes immediate overhead for what may not be meaningful performance gains  
  * An example of overhead `const val = x + 1` ran through `useMemo` is more overhead
* Rarely profiled the performance impact as that would require even more development time
* React compiler claims it will save the world
* Less maintainable due to more code being written
* https://overreacted.io/before-you-memo/ by dan abramov
* `useMemo` often breaks the continuity of reading
* Viral in nature. Parent passing props must be stable to children components.
  * You don't know if a component is trying to be optimized with memo without looking at it.
  * This implementation detail is leaky.
* https://cekrem.github.io/posts/react-memo-when-it-helps-when-it-hurts/

## When then?
* Memoization should either be avoided until a performance issue is noticed or when you have reusable pieces that you
can spend significantly more time optimizing
* If you cannot do alternative approaches such as moving state down or lift content up as mentioned in https://overreacted.io/before-you-memo/ 

Even more ideal would be kicking the can down the road for [React Compiler](https://react.dev/learn/react-compiler), as that is a large goal of it to remove the manual work of optimizing.

An example of getting improved performance with memoization is seen in a few places:
* `src/app/components/data-table/data-table-toolbar.tsx` `InputFilter` utilizes `useMemo` to prevent excessive renders whenever 
we render from table state changes
* `src/app/components/data-table/data-table-faceted-filter.tsx` shows a more involved memoization effort as the state was not moved down
* `src/app/components/data-table/data-table-view-options.tsx` shows how the improved simplicity of moving state down handling most render optimation
while keeping the code generally simpler
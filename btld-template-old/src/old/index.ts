// @ts-nocheck

/*

 Part 0 - name some stuff
  - @test is an utility function
  - x.y.z.@test is an expression, path, accessor ???

 Part 1 parse attributes
  - no parsing of constants is needed (too complex with all possible data types)
  - only parse specific attributes: repeat, bind, data, if, aria, init, on

 Part 2 - speed test
  - test: template to string
  - test: template to dom
  - test: iterating elements + calling innerHTML on every element
  - test: iterating elements + iterating specific attributes
  - test: iterating elements + iterating all attributes

 Part 3 - parse template

 Part 4 - deal with nested templates
  - ! the template remains as an anchor point
  - use custom components for places where that is not possible like: li, td, tr, etc.
  - drag & drop should reorder the templates without totally breaking the templating
  - types of array modifications: push, remove@index, add@index, other: reposition every element

  Examples:
  - use constants from attributes: repeat="@attr.data-count" data-count="3"
  - bind attributes / properties: bind="data-test: person.@fullname.@uppercase" 
  - bind dataset values: data="first: firstname, last: lastname"
  - <template tag="span" repeat="list">
  - <template if="person.firstname.@eq" value="florian">
  - <template if="person.role.@includedIn" value-list="r1,r2,r3">

  Some bind values are special and dont get directly refelected to DOM attributes:
  - <template repeat="list" bind="tag: field-type">
  - <template if="person.firstname.@eq" bind="value: person.lastname">

  Dom Events:
  - on="click: person.@reloadData" person-reload-id="123"
  - on="click: person.@reloadData" bind="person-reload-id: person.id"
  The custom utility function "triggerOpen" gets the type of event
  - on="click: @triggerOpen" target="#my-modal"
  - on="click: @triggerOpen" click-target="#my-modal"
*/

BtldState.functions({
  'this': (state) => state,
  'root': BtldState.root,
  'parent': BtldState.parent,
})


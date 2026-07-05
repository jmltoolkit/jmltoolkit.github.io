# Coding Style

- indent with four spaces
- wrap lines at 120 characters
- type and method annotations go on a separate line
- wrapped arguments are aligned to opening parenthesis

# Adding new files

Newly added files must contain the correct Copyright and License header comment:
```
/*
 * Copyright (C) 2011, 2013-2026 The JavaParser Team.
 *
 * This file is part of JavaParser.
 * 
 * JavaParser can be used either under the terms of
 * a) the GNU Lesser General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 * b) the terms of the Apache License 
 *
 * You should have received a copy of both licenses in LICENCE.LGPL and
 * LICENCE.APACHE. Please refer to those files for details.
 *
 * JavaParser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 */

```
**WARNING:** Notice that there is an empty line between the Copyright and License comment and the package declaration.

To configure your IDE to automatically add the header see the [IDE Settings](https://github.com/javaparser/javaparser/wiki/Coding-Guidelines#ide-settings) section below.

# IDE Settings

## IDEA

### Code Style

Copy `dev-files/JavaParser-idea.xml` to `.IdeaIC14/config/codestyles/` and select it in 'Settings > Editor > Code Style'.

In 'Settings > Editor > Code Style' select item as follows:
*  [y] Wrap when typing reaches right margin

In 'Settings > Editor > General':
* Other
  * Strip trailing spaces on Save: 'Modified Lines'
    * [y] Ensure line feed at file end on Save

### Copyright and License

Go to 'Settings > Editor > Copyright > Copyright Profiles'. Click the '+' button to add a 'JavaParser' profile with the following text:
```
Copyright (C) 2011, 2013-2026 The JavaParser Team.

This file is part of JavaParser.
 
JavaParser can be used either under the terms of
a) the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
b) the terms of the Apache License 

You should have received a copy of both licenses in LICENCE.LGPL and
LICENCE.APACHE. Please refer to those files for details.

JavaParser is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.
```

Then go up to 'Settings > Editor > Copyright' and select 'JavaParser' as the 'Default project copyright' (this applies to the current project).

## Eclipse

### Code Style

Import formatter settings dev-files/JavaParser-eclipse.xml

Go to 'Window > Preferences > Java > Code Style > Formatter and select JavaParser-eclipse.xml.

In 'Preferences > Java> Editor > Save Actions' select items as follows:
* [y] Perform the selected actions on save
  * [y] Format source code
    * [n] Format all lines
    * [y] Format edited lines

### Copyright and License

Go to 'Window > Preferences > Java > Code Style > Code Templates ', expands Code and select “New Java Files”, click 'Edit' to add the following text:

```
/*
 * Copyright (C) 2011, 2013-2026 The JavaParser Team.
 *
 * This file is part of JavaParser.
 * 
 * JavaParser can be used either under the terms of
 * a) the GNU Lesser General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 * b) the terms of the Apache License 
 *
 * You should have received a copy of both licenses in LICENCE.LGPL and
 * LICENCE.APACHE. Please refer to those files for details.
 *
 * JavaParser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 */

${filecomment}
${package_declaration}

${typecomment}
${type_declaration}
```
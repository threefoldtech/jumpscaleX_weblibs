# include tests

```
!!!include
name = "Fixer.py"
repo = "https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/tools/fixer"
docstring = "write_changes"
```

- is below including some other doc

## from this repo in code block

```
!!!include("test5")
```

## from other repo in code block

```
!!!include("jumpscale:install")
```

## macro without code block


!!!include("test5")


## include part of file

!!!include(name="Fixer.py",repo="https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/tools/fixer",start="def find_changes",end="self.replacer.dir_process(")


### possibility 1: specify start line and end line

```
!!!include
name = "Fixer.py"
repo = "https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/tools/fixer"
start = "def find_changes"
end = "self.replacer.dir_process("
codeblock = True
```

### possibility 2: use the paragraph argument

```
!!!include
name = "Fixer.py"
repo = "https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/tools/fixer"
start = "def find_changes"
paragraph = True
codeblock = True
```

they will both return the lines of def find_changes... and nothing more

## can also just include a document string from a python method

- this only works for python

```
!!!include
name = "Fixer.py"
repo = "https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/tools/fixer"
docstring = "write_changes"
```
will always include as markdown without code block

Will look for classname or for def name

## any file can be included as markdown

```
!!!include
name = "rivine/README.md"
repo = "https://github.com/threefoldtech/jumpscaleX/tree/master/Jumpscale/"
```

path of path can be specified



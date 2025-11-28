# mcpedl
Unofficial MCPEDL Nodejs API


# How To Use


## Search

```
const mc = new Mcpedl()
// (query, page)
const res = await mc.search("1.21", 13)

console.log(res)
```
## List (viewing list latest Minecraft)

```
const mc = new Mcpedl()
// (query, page)
const res = await mc.search("1.21", 13)

console.log(res)
```

## Detail

```
const mc = new Mcpedl()
// (id from post)
const res = await mc.detail("minecraft-pe-1-21-124-apk")

console.log(res)
```


## Download

```
const mc = new Mcpedl()
// (id from file)
const res = await mc.download(6517)

console.log(res)
```

made by terastudio-org

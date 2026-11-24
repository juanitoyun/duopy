from collections import deque


def bfs(g, inicio):
    vistos = {inicio}
    cola = deque([inicio])
    orden = []
    while cola:
        u = cola.popleft()
        orden.append(u)
        for v in g[u]:
            if v not in vistos:
                vistos.add(v)
                cola.append(v)
    return orden


g = {0: [1, 2], 1: [3], 2: [3], 3: []}
assert bfs(g, 0) == [0, 1, 2, 3]
print(bfs(g, 0))

class Nodo:
    def __init__(self, x):
        self.x = x
        self.izq = self.der = None


def insertar(t, x):
    if t is None:
        return Nodo(x)
    if x < t.x:
        t.izq = insertar(t.izq, x)
    elif x > t.x:
        t.der = insertar(t.der, x)
    return t


def inorden(t):
    if t is None:
        return []
    return inorden(t.izq) + [t.x] + inorden(t.der)


raiz = None
for x in [8, 3, 10, 1]:
    raiz = insertar(raiz, x)
assert inorden(raiz) == [1, 3, 8, 10]
print(inorden(raiz))

# busqueda: list[int] int -> int
# Pre: a está ordenada.
# Retorna un índice de x, o -1.
def busqueda(a, x):
    i, j = 0, len(a) - 1
    while i <= j:
        m = (i + j) // 2
        if a[m] == x:
            return m
        if a[m] < x:
            i = m + 1
        else:
            j = m - 1
    return -1


assert busqueda([1, 3, 8], 3) == 1
assert busqueda([], 3) == -1
print(busqueda([1, 3, 8], 8))

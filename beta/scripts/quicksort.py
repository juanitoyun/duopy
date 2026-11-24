# quicksort: list -> None
# Ordena in-place (partición de Lomuto).
def quicksort(a):
    def ordenar(i, j):
        if i >= j:
            return
        p = a[j]
        k = i
        for t in range(i, j):
            if a[t] <= p:
                a[k], a[t] = a[t], a[k]
                k += 1
        a[k], a[j] = a[j], a[k]
        ordenar(i, k - 1)
        ordenar(k + 1, j)
    ordenar(0, len(a) - 1)


a = [8, 3, 5, 3, 1]
quicksort(a)
assert a == [1, 3, 3, 5, 8]
print(a)
